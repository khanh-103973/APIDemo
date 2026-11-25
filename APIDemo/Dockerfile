# Stage 1: Base runtime (.NET 10 ASP.NET Core)
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app

# Cài curl để Docker healthcheck kiểm tra /health và tạo sẵn thư mục ghi file cho non-root user
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /app/wwwroot/images /app/Logs \
    && chown -R $APP_UID:$APP_UID /app

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

# Stage 2: Build (.NET 10 SDK)
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copy csproj trước để tận dụng Docker layer cache cho dotnet restore
COPY ["APIDemo/APIDemo.csproj", "APIDemo/"]
RUN dotnet restore "./APIDemo/APIDemo.csproj"

COPY ["APIDemo/", "APIDemo/"]
WORKDIR "/src/APIDemo"
RUN dotnet build "./APIDemo.csproj" -c "$BUILD_CONFIGURATION" --no-restore -o /app/build

# Stage 3: Publish
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./APIDemo.csproj" -c "$BUILD_CONFIGURATION" --no-restore -o /app/publish /p:UseAppHost=false

# Stage 4: Final production image
FROM base AS final
WORKDIR /app
COPY --from=publish --chown=$APP_UID:$APP_UID /app/publish .

USER $APP_UID

HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=5 \
    CMD curl -fsS http://localhost:8080/health || exit 1

ENTRYPOINT ["dotnet", "APIDemo.dll"]
