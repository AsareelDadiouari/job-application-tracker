FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY global.json JobTracker.slnx ./
COPY src/JobTracker.Api/JobTracker.Api.csproj src/JobTracker.Api/
RUN dotnet restore src/JobTracker.Api/JobTracker.Api.csproj
COPY src/ src/
RUN dotnet publish src/JobTracker.Api -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app .
USER $APP_UID
EXPOSE 8080
ENTRYPOINT ["dotnet", "JobTracker.Api.dll"]
