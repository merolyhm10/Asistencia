using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using MongoDB.Driver;
using Asistencias.Configuration;
using Microsoft.Extensions.Options;

var builder = WebApplication.CreateBuilder(args);

// Register MongoDB client
builder.Services.Configure<MongoDBSettings>(builder.Configuration.GetSection("MongoDB"));
builder.Services.AddSingleton<IMongoClient>(serviceProvider =>
{
    var settings = serviceProvider.GetRequiredService<IOptions<MongoDBSettings>>().Value;
    return new MongoClient(settings.ConnectionString);
});

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddSingleton<Consulta>(); // Add your event query service

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins",
        builder => builder.AllowAnyOrigin()  // Allow requests from any origin
                          .AllowAnyMethod()
                          .AllowAnyHeader());
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAllOrigins"); // Use the updated CORS policy
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

// API Extensions for events
Consulta.ApiExtensions.CreateEvent(app);
Consulta.ApiExtensions.UploadExcelFile(app);
Consulta.ApiExtensions.GetEvents(app);
Consulta.ApiExtensions.GetEventById(app);
Consulta.ApiExtensions.UpdateEvent(app);


app.Run();
