using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Asistencias.Models
{
    public class EventCreate
    {
        [BsonId]
        public ObjectId Id { get; set; }

        [BsonElement("Title")]
        public string Title { get; set; }

        [BsonElement("Location")]
        public string Location { get; set; }

        [BsonElement("Schedule")]
        public string Schedule { get; set; }

        [BsonElement("Manager")]
        public string Manager { get; set; }

        [BsonElement("Description")]
        public string Description { get; set; }

        [BsonElement("DateRegistered")]
        public DateTime DateRegistered { get; set; }

        [BsonElement("ExcelFile")]
        public byte[]? ExcelFile { get; set; }


    }

    public class EventRead
    {
        [BsonId]
        public string _id { get; set; }

        [BsonElement("Title")]
        public string Title { get; set; }

        [BsonElement("Location")]
        public string Location { get; set; }

        [BsonElement("Schedule")]
        public string Schedule { get; set; }

        [BsonElement("Manager")]
        public string Manager { get; set; }

        [BsonElement("Description")]
        public string Description { get; set; }

        [BsonElement("DateRegistered")]
        public DateTime DateRegistered { get; set; }

        [BsonElement("ExcelFile")]
        public byte[]? ExcelFile { get; set; } // Cambiado de ImageBase64 a ExcelFile


    }



    public class ServerResult
    {
        public bool Exito { get; set; } // Success flag
        public string Mensaje { get; set; } // Response message
        public object Resultado { get; set; } // The result (can hold any type, like EventCreate or EventRead)
    }
}
