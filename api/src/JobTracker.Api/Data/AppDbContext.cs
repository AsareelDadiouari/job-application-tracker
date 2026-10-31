using JobTracker.Api.Applications;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<JobApplication> Applications => Set<JobApplication>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<JobApplication>(entity =>
        {
            entity.ToTable("applications");
            entity.Property(a => a.Company).HasMaxLength(200);
            entity.Property(a => a.Position).HasMaxLength(200);
            entity.Property(a => a.JobUrl).HasMaxLength(2048);
            entity.Property(a => a.Status).HasConversion<string>().HasMaxLength(20);
            entity.HasIndex(a => a.Status);
        });
    }
}
