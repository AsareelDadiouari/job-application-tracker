namespace JobTracker.Api.Applications;

public enum ApplicationStatus
{
    ToApply,
    Applied,
    Interview,
    Offer,
    Rejected
}

public class JobApplication
{
    public Guid Id { get; set; }
    public required string Company { get; set; }
    public required string Position { get; set; }
    public ApplicationStatus Status { get; set; } = ApplicationStatus.ToApply;
    public string? JobUrl { get; set; }
    public string? Notes { get; set; }
    public DateOnly? AppliedOn { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
