using Neaproject.Data;
using Neaproject.Dtos;
using Neaproject.Models;
using Neaproject.Oop;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<SqliteDataAccess>();
builder.Services.AddControllers();  


var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();
app.MapControllers();


app.MapGet("/", () => Results.Redirect("/css/index.html"));

app.Run();
