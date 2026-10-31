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
