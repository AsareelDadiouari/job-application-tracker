using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using JobTracker.Api.Applications;
using JobTracker.Api.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace JobTracker.Api.Tests;

public class ApiFactory : WebApplicationFactory<Program>
{
    private readonly string _databaseName = Guid.NewGuid().ToString();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<DbContextOptions<AppDbContext>>();
            services.RemoveAll<IDbContextOptionsConfiguration<AppDbContext>>();
            services.AddDbContext<AppDbContext>(options => options.UseInMemoryDatabase(_databaseName));
        });
    }
}

public class ApplicationEndpointsTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter() }
    };

    private readonly HttpClient _client = factory.CreateClient();

    [Fact]
    public async Task Created_application_can_be_fetched_and_updated()
    {
        var request = new ApplicationRequest("Acme", "Backend Developer", ApplicationStatus.Applied, null, null, null);

        var created = await _client.PostAsJsonAsync("/api/applications", request, Json);
        Assert.Equal(HttpStatusCode.Created, created.StatusCode);
        var application = await created.Content.ReadFromJsonAsync<JobApplication>(Json);

        var updated = await _client.PutAsJsonAsync(
            $"/api/applications/{application!.Id}", request with { Status = ApplicationStatus.Interview }, Json);
        Assert.Equal(HttpStatusCode.OK, updated.StatusCode);

        var fetched = await _client.GetFromJsonAsync<JobApplication>($"/api/applications/{application.Id}", Json);
        Assert.Equal(ApplicationStatus.Interview, fetched!.Status);
    }

    [Fact]
    public async Task Follow_up_reminder_and_contact_details_are_saved_and_cleared()
    {
        var followUpDate = new DateOnly(2026, 11, 10);
        var request = new ApplicationRequest(
            Company: "Globex",
            Position: "Platform Engineer",
            Status: ApplicationStatus.Interview,
            JobUrl: "https://globex.example/jobs/1",
            Notes: "Great first call",
            AppliedOn: new DateOnly(2026, 11, 1),
            FollowUpOn: followUpDate,
            FollowUpNote: "Send thank-you email to Sarah",
            ContactName: "Sarah Jenkins",
            ContactEmail: "sarah@globex.example",
            ContactRole: "Technical Recruiter");

        var created = await _client.PostAsJsonAsync("/api/applications", request, Json);
        Assert.Equal(HttpStatusCode.Created, created.StatusCode);
        var saved = await created.Content.ReadFromJsonAsync<JobApplication>(Json);

        Assert.NotNull(saved);
        Assert.Equal(followUpDate, saved.FollowUpOn);
        Assert.Equal("Send thank-you email to Sarah", saved.FollowUpNote);
        Assert.Equal("Sarah Jenkins", saved.ContactName);
        Assert.Equal("sarah@globex.example", saved.ContactEmail);
        Assert.Equal("Technical Recruiter", saved.ContactRole);

        var cleared = await _client.PutAsJsonAsync(
            $"/api/applications/{saved.Id}",
            request with { FollowUpOn = null, FollowUpNote = null },
            Json);
        Assert.Equal(HttpStatusCode.OK, cleared.StatusCode);

        var fetched = await _client.GetFromJsonAsync<JobApplication>($"/api/applications/{saved.Id}", Json);
        Assert.Null(fetched!.FollowUpOn);
        Assert.Null(fetched.FollowUpNote);
        Assert.Equal("Sarah Jenkins", fetched.ContactName);
    }

    [Fact]
    public async Task Document_versions_are_tracked_per_application()
    {
        var request = new ApplicationRequest(
            Company: "Initech",
            Position: "Full-Stack Developer",
            Status: ApplicationStatus.Applied,
            JobUrl: null,
            Notes: null,
            AppliedOn: new DateOnly(2026, 11, 1),
            ResumeVersion: "Resume-Backend-v3-EN.pdf",
            CoverLetterVersion: "CoverLetter-Initech.pdf");

        var created = await _client.PostAsJsonAsync("/api/applications", request, Json);
        Assert.Equal(HttpStatusCode.Created, created.StatusCode);
        var saved = await created.Content.ReadFromJsonAsync<JobApplication>(Json);

        Assert.NotNull(saved);
        Assert.Equal("Resume-Backend-v3-EN.pdf", saved.ResumeVersion);
        Assert.Equal("CoverLetter-Initech.pdf", saved.CoverLetterVersion);
    }

    [Fact]
    public async Task Missing_company_is_rejected()
    {
        var response = await _client.PostAsJsonAsync(
            "/api/applications", new { position = "Developer", status = "Applied" }, Json);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Unknown_application_returns_not_found()
    {
        var response = await _client.GetAsync($"/api/applications/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
