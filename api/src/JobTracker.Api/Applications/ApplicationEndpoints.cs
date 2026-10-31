using System.ComponentModel.DataAnnotations;
using JobTracker.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.Api.Applications;

public record ApplicationRequest(
    [property: Required, MaxLength(200)] string Company,
    [property: Required, MaxLength(200)] string Position,
    ApplicationStatus Status,
    [property: MaxLength(2048)] string? JobUrl,
    string? Notes,
    DateOnly? AppliedOn);

public static class ApplicationEndpoints
{
    public static RouteGroupBuilder MapApplicationEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/applications").WithTags("Applications");

        group.MapGet("/", async (AppDbContext db) =>
            await db.Applications.AsNoTracking().OrderByDescending(a => a.UpdatedAt).ToListAsync());

        group.MapGet("/{id:guid}", async (Guid id, AppDbContext db) =>
            await db.Applications.FindAsync(id) is { } application
                ? Results.Ok(application)
                : Results.NotFound());

        group.MapPost("/", async (ApplicationRequest request, AppDbContext db, TimeProvider clock) =>
        {
            var now = clock.GetUtcNow();
            var application = new JobApplication
            {
                Id = Guid.CreateVersion7(),
                Company = request.Company,
                Position = request.Position,
                CreatedAt = now
            };
            Apply(application, request, now);

            db.Applications.Add(application);
            await db.SaveChangesAsync();
            return Results.Created($"/api/applications/{application.Id}", application);
        });

        group.MapPut("/{id:guid}", async (Guid id, ApplicationRequest request, AppDbContext db, TimeProvider clock) =>
        {
            if (await db.Applications.FindAsync(id) is not { } application)
            {
                return Results.NotFound();
            }

            Apply(application, request, clock.GetUtcNow());
            await db.SaveChangesAsync();
            return Results.Ok(application);
        });

        group.MapDelete("/{id:guid}", async (Guid id, AppDbContext db) =>
            await db.Applications.Where(a => a.Id == id).ExecuteDeleteAsync() > 0
                ? Results.NoContent()
                : Results.NotFound());

        return group;
    }

    private static void Apply(JobApplication application, ApplicationRequest request, DateTimeOffset now)
    {
        application.Company = request.Company;
        application.Position = request.Position;
        application.Status = request.Status;
        application.JobUrl = request.JobUrl;
        application.Notes = request.Notes;
        application.AppliedOn = request.AppliedOn;
        application.UpdatedAt = now;
    }
}
