using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JobTracker.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddFollowUpsContactsAndDocuments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ContactEmail",
                table: "applications",
                type: "character varying(320)",
                maxLength: 320,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContactName",
                table: "applications",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContactRole",
                table: "applications",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CoverLetterVersion",
                table: "applications",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FollowUpNote",
                table: "applications",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<DateOnly>(
                name: "FollowUpOn",
                table: "applications",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ResumeVersion",
                table: "applications",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_applications_FollowUpOn",
                table: "applications",
                column: "FollowUpOn");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_applications_FollowUpOn",
                table: "applications");

            migrationBuilder.DropColumn(
                name: "ContactEmail",
                table: "applications");

            migrationBuilder.DropColumn(
                name: "ContactName",
                table: "applications");

            migrationBuilder.DropColumn(
                name: "ContactRole",
                table: "applications");

            migrationBuilder.DropColumn(
                name: "CoverLetterVersion",
                table: "applications");

            migrationBuilder.DropColumn(
                name: "FollowUpNote",
                table: "applications");

            migrationBuilder.DropColumn(
                name: "FollowUpOn",
                table: "applications");

            migrationBuilder.DropColumn(
                name: "ResumeVersion",
                table: "applications");
        }
    }
}
