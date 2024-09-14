using Asistencias.Models;
using MongoDB.Bson;
using MongoDB.Driver;
using Microsoft.AspNetCore.Http;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using Microsoft.AspNetCore.Mvc;

public class Consulta
{
    private readonly IMongoCollection<EventCreate> _eventCollection;

    public Consulta(IMongoClient mongoClient)
    {
        var database = mongoClient.GetDatabase("marinadb");
        _eventCollection = database.GetCollection<EventCreate>("eventos");
    }

    public async Task<ServerResult> CreateEvent(EventCreate newEvent)
    {
        if (newEvent == null)
        {
            return new ServerResult
            {
                Exito = false,
                Mensaje = "Event cannot be null",
                Resultado = null
            };
        }

        newEvent.DateRegistered = DateTime.UtcNow;

        try
        {
            await _eventCollection.InsertOneAsync(newEvent);
            return new ServerResult
            {
                Exito = true,
                Mensaje = "Event created successfully",
                Resultado = newEvent.Id.ToString()
            };
        }
        catch (Exception ex)
        {
            return new ServerResult
            {
                Exito = false,
                Mensaje = $"Error creating event: {ex.Message}",
                Resultado = null
            };
        }
    }

    public async Task<ServerResult> UploadExcelFile(IFormFile file, string eventId)
    {
        if (file == null || file.Length == 0)
        {
            return new ServerResult
            {
                Exito = false,
                Mensaje = "File is empty or not provided",
                Resultado = null
            };
        }

        try
        {
            var objectId = ObjectId.Parse(eventId);

            using (var memoryStream = new MemoryStream())
            {
                await file.CopyToAsync(memoryStream);
                var excelData = memoryStream.ToArray();

                var filter = Builders<EventCreate>.Filter.Eq(e => e.Id, objectId);
                var update = Builders<EventCreate>.Update.Set(e => e.ExcelFile, excelData);

                var result = await _eventCollection.UpdateOneAsync(filter, update);

                if (result.ModifiedCount > 0)
                {
                    return new ServerResult
                    {
                        Exito = true,
                        Mensaje = "File uploaded successfully",
                        Resultado = null
                    };
                }

                return new ServerResult
                {
                    Exito = false,
                    Mensaje = "Event not found",
                    Resultado = null
                };
            }
        }
        catch (FormatException)
        {
            return new ServerResult
            {
                Exito = false,
                Mensaje = "Invalid event ID format",
                Resultado = null
            };
        }
        catch (Exception ex)
        {
            return new ServerResult
            {
                Exito = false,
                Mensaje = $"Error uploading file: {ex.Message}",
                Resultado = null
            };
        }
    }

    public async Task<ServerResult> GetEvents()
    {
        try
        {
            var events = await _eventCollection.Find(_ => true).ToListAsync();

            var eventList = events.Select(e => new EventRead
            {
                _id = e.Id.ToString(),
                Title = e.Title,
                Location = e.Location,
                Schedule = e.Schedule,
                Manager = e.Manager,
                Description = e.Description,
                DateRegistered = e.DateRegistered,
                ExcelFile = e.ExcelFile
            }).ToList();

            return new ServerResult
            {
                Exito = true,
                Mensaje = "Eventos recuperados exitosamente",
                Resultado = eventList
            };
        }
        catch (Exception ex)
        {
            return new ServerResult
            {
                Exito = false,
                Mensaje = $"Error al recuperar eventos: {ex.Message}",
                Resultado = null
            };
        }
    }

    public async Task<ServerResult> GetEventById(string id)
    {
        try
        {
            var objectId = ObjectId.Parse(id);
            var evento = await _eventCollection.Find(e => e.Id == objectId).FirstOrDefaultAsync();

            if (evento == null)
            {
                return new ServerResult
                {
                    Exito = false,
                    Mensaje = "Event not found",
                    Resultado = null
                };
            }

            var eventRead = new EventRead
            {
                _id = evento.Id.ToString(),
                Title = evento.Title,
                Location = evento.Location,
                Schedule = evento.Schedule,
                Manager = evento.Manager,
                Description = evento.Description,
                DateRegistered = evento.DateRegistered,
                ExcelFile = evento.ExcelFile
            };

            return new ServerResult
            {
                Exito = true,
                Mensaje = "Event retrieved successfully",
                Resultado = eventRead
            };
        }
        catch (FormatException)
        {
            return new ServerResult
            {
                Exito = false,
                Mensaje = "Invalid event ID format",
                Resultado = null
            };
        }
        catch (Exception ex)
        {
            return new ServerResult
            {
                Exito = false,
                Mensaje = $"Error retrieving event: {ex.Message}",
                Resultado = null
            };
        }

    }

    




    public static class ApiExtensions
    {
        public static void CreateEvent(WebApplication app)
        {
            app.MapPost("/api/eventCreate", async (HttpRequest request, Consulta consulta) =>
            {
                try
                {
                    var form = await request.ReadFormAsync();

                    var newEvent = new EventCreate
                    {
                        Title = form["title"],
                        Location = form["location"],
                        Schedule = form["schedule"],
                        Manager = form["manager"],
                        Description = form["description"],
                        DateRegistered = DateTime.UtcNow
                    };

                    var result = await consulta.CreateEvent(newEvent);

                    if (form.Files.Count > 0)
                    {
                        var file = form.Files.GetFile("file");
                        if (file != null && file.Length > 0)
                        {
                            var eventId = result.Resultado as string;
                            if (eventId != null)
                            {
                                var fileResult = await consulta.UploadExcelFile(file, eventId);

                                if (!fileResult.Exito)
                                {
                                    return Results.Json(fileResult);
                                }
                            }
                        }
                    }

                    return result.Exito ? Results.Ok(result) : Results.Json(result);
                }
                catch (Exception ex)
                {
                    return Results.Json(new ServerResult
                    {
                        Exito = false,
                        Mensaje = $"Error creating event: {ex.Message}",
                        Resultado = null
                    });
                }
            })
            .Produces<ServerResult>()
            .WithTags("Events")
            .WithDescription("Create a new event")
            .Accepts<IFormCollection>("multipart/form-data");
        }

        public static void UploadExcelFile(WebApplication app)
        {
            app.MapPost("/api/uploadExcelFile", async (HttpRequest request, Consulta consulta) =>
            {
                try
                {
                    var form = await request.ReadFormAsync();
                    var file = form.Files.GetFile("file");
                    var eventId = form["eventId"];

                    if (file != null && file.Length > 0 && !string.IsNullOrEmpty(eventId))
                    {
                        var result = await consulta.UploadExcelFile(file, eventId);
                        return result.Exito ? Results.Ok(result) : Results.Json(result);
                    }

                    return Results.Json(new ServerResult
                    {
                        Exito = false,
                        Mensaje = "File or event ID missing",
                        Resultado = null
                    });
                }
                catch (Exception ex)
                {
                    return Results.Json(new ServerResult
                    {
                        Exito = false,
                        Mensaje = $"Error uploading file: {ex.Message}",
                        Resultado = null
                    });
                }
            })
            .Produces<ServerResult>()
            .WithTags("Events")
            .WithDescription("Upload an Excel file for an existing event")
            .Accepts<IFormCollection>("multipart/form-data");
        }

        public static void GetEvents(WebApplication app)
        {
            app.MapGet("/api/eventsRead", async (Consulta consulta) =>
            {
                try
                {
                    var result = await consulta.GetEvents();
                    return result.Exito ? Results.Ok(result) : Results.Json(result);
                }
                catch (Exception ex)
                {
                    return Results.Json(new ServerResult
                    {
                        Exito = false,
                        Mensaje = $"Error retrieving events: {ex.Message}",
                        Resultado = null
                    });
                }
            })
            .Produces<ServerResult>()
            .WithTags("Events")
            .WithDescription("Retrieve all events");
        }

        public static void GetEventById(WebApplication app)
        {
            app.MapGet("/api/event/{id}", async (string id, Consulta consulta) =>
            {
                var result = await consulta.GetEventById(id);
                return result.Exito ? Results.Ok(result) : Results.Json(result);
            })
            .Produces<ServerResult>()
            .WithTags("Events")
            .WithDescription("Retrieve event by ID");
        }


    }


}