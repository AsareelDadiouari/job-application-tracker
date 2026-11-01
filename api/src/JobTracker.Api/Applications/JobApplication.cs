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
    public DateOnly? FollowUpOn { get; set; }
    public string? FollowUpNote { get; set; }
    public string? ContactName { get; set; }
    public string? ContactEmail { get; set; }
    public string? ContactRole { get; set; }
    public string? ResumeVersion { get; set; }
    public string? CoverLetterVersion { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
