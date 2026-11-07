Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "         I-ITSM AUTOMATED LIVE DEMO: FULL END-TO-END SYSTEM WALKTHROUGH        " -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan
Start-Sleep -Seconds 1

# -----------------------------------------------------------------------------
# STEP 1: EMPLOYEE REGISTRATION & AUTHENTICATION
# -----------------------------------------------------------------------------
Write-Host "`n>>> [STEP 1] EMPLOYEE REGISTRATION & AUTHENTICATION" -ForegroundColor Yellow
$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$empUsername = "alice_demo_$timestamp"
$regPayload = @{
    username   = $empUsername
    email      = "$empUsername@company.com"
    password   = "SecurePass@123"
    fullName   = "Alice Employee"
    department = "Marketing"
    phone      = "+1-555-0199"
    role       = "EMPLOYEE"
} | ConvertTo-Json

Write-Host "Registering new employee '$empUsername'..."
$regRes = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" -Method Post -Body $regPayload -ContentType "application/json"
Write-Host "? Registration Successful: Role assigned = $($regRes.role)" -ForegroundColor Green

Write-Host "Logging in as '$empUsername' to obtain signed JWT token..."
$loginPayload = @{ username = $empUsername; password = "SecurePass@123" } | ConvertTo-Json
$empAuth = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body $loginPayload -ContentType "application/json"
$empHeaders = @{ Authorization = "Bearer $($empAuth.token)"; "Content-Type" = "application/json" }
Write-Host "? Authentication Successful: JWT Token acquired for user ID $($empAuth.userId)" -ForegroundColor Green
Start-Sleep -Seconds 1

# -----------------------------------------------------------------------------
# STEP 2: INTELLIGENT RULE-BASED FEATURES
# -----------------------------------------------------------------------------
Write-Host "`n>>> [STEP 2] DEMONSTRATING INTELLIGENT RULE-BASED FEATURES" -ForegroundColor Yellow

# Feature 2A: Auto-Category Suggestion
Write-Host "A. Testing Intelligent Category Suggestion Engine..."
$suggestRes = Invoke-RestMethod -Uri "http://localhost:8080/api/incidents/suggest-category?title=Office+VPN+disconnected+and+wifi+failing&description=Cannot+access+internet+from+laptop" -Method Get -Headers $empHeaders
Write-Host "   Input Text: 'Office VPN disconnected and wifi failing'"
Write-Host "   ? Algorithm Suggestion: Category ID $($suggestRes.categoryId) -> '$($suggestRes.categoryName)'" -ForegroundColor Green

# Feature 2B: Duplicate Incident Detection
Write-Host "B. Testing Intelligent Duplicate Incident Detection..."
$dupRes = Invoke-RestMethod -Uri "http://localhost:8080/api/incidents/check-duplicates?title=Corporate+WiFi+is+down&description=Wifi+connection+dropped" -Method Get -Headers $empHeaders
Write-Host "   Checked for potential duplicates against active incidents."
Write-Host "   ? Potential duplicates found for review: $($dupRes.Count) existing ticket(s)" -ForegroundColor Green
Start-Sleep -Seconds 1

# -----------------------------------------------------------------------------
# STEP 3: PRIORITY ENGINE & INCIDENT CREATION
# -----------------------------------------------------------------------------
Write-Host "`n>>> [STEP 3] RULE-BASED PRIORITY ENGINE & INCIDENT CREATION" -ForegroundColor Yellow
Write-Host "Impact: 3 (High) | Urgency: 3 (High) | Business Criticality: 2 (Medium)"
Write-Host "Priority Calculation: 3 x 3 x 2 = 18 -> Mapped to 'P1_CRITICAL' (Range: 18-27)"

$createPayload = @{
    title               = "Critical Corporate WiFi & VPN Outage in Building B"
    description         = "All wireless access points and VPN gateways in Building B are unreachable. Marketing and Sales teams cannot access cloud databases."
    categoryId          = 1
    serviceId           = 1
    impact              = 3
    urgency             = 3
    businessCriticality = 2
} | ConvertTo-Json

$newIncident = Invoke-RestMethod -Uri "http://localhost:8080/api/incidents" -Method Post -Body $createPayload -Headers $empHeaders
$incId = $newIncident.id
Write-Host "? Incident Created Successfully!" -ForegroundColor Green
Write-Host "   • Incident Number: $($newIncident.incidentNumber)"
Write-Host "   • Initial Status : $($newIncident.status) (State Machine Entry)"
Write-Host "   • Priority Score : $($newIncident.priorityScore)"
Write-Host "   • Priority Level : $($newIncident.priority)" -ForegroundColor Red
Start-Sleep -Seconds 1

# -----------------------------------------------------------------------------
# STEP 4: TECHNICIAN ASSIGNMENT VIA STRATEGY PATTERN
# -----------------------------------------------------------------------------
Write-Host "`n>>> [STEP 4] TECHNICIAN ASSIGNMENT (GoF STRATEGY PATTERN)" -ForegroundColor Yellow
# Admin login to classify and assign
$adminAuth = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body (@{ username = "admin"; password = "Admin@123" } | ConvertTo-Json) -ContentType "application/json"
$adminHeaders = @{ Authorization = "Bearer $($adminAuth.token)"; "Content-Type" = "application/json" }

$activeStrategy = (Invoke-RestMethod -Uri "http://localhost:8080/api/admin/strategy" -Method Get -Headers $adminHeaders).strategy
Write-Host "Current Active Strategy: $activeStrategy"

Write-Host "Classifying incident and triggering automated strategy assignment..."
$classifyPayload = @{
    categoryId          = 1
    serviceId           = 1
    impact              = 3
    urgency             = 3
    businessCriticality = 2
} | ConvertTo-Json

$assignedInc = Invoke-RestMethod -Uri "http://localhost:8080/api/incidents/$incId/classify" -Method Post -Body $classifyPayload -Headers $adminHeaders
Write-Host "? Assignment Executed:" -ForegroundColor Green
Write-Host "   • New Status        : $($assignedInc.status)"
Write-Host "   • Assigned Tech     : $($assignedInc.assignedTechnician.user.fullName)" -ForegroundColor Cyan
Write-Host "   • Tech Specialization: $($assignedInc.assignedTechnician.specialization)"
Start-Sleep -Seconds 1

# -----------------------------------------------------------------------------
# STEP 5: VERIFYING OBSERVER PATTERN (AUDIT TRAIL & NOTIFICATIONS)
# -----------------------------------------------------------------------------
Write-Host "`n>>> [STEP 5] VERIFYING OBSERVER PATTERN (EVENT LISTENER SUITE)" -ForegroundColor Yellow
Start-Sleep -Milliseconds 800  # Allow async observers to persist

$auditLogs = Invoke-RestMethod -Uri "http://localhost:8080/api/audit/incident/$incId" -Method Get -Headers $adminHeaders
Write-Host "? Immutable Audit Trail Entries Captured via ApplicationEventPublisher:" -ForegroundColor Green
foreach ($log in $auditLogs) {
    Write-Host "   [$($log.action)] Transition: $($log.previousState) -> $($log.newState) | By: $($log.actor.username)"
}

$notifs = Invoke-RestMethod -Uri "http://localhost:8080/api/notifications" -Method Get -Headers $empHeaders
Write-Host "? In-App Notifications Delivered to Reporter (Alice):" -ForegroundColor Green
foreach ($n in $notifs | Select-Object -First 2) {
    Write-Host "   • $($n.title): $($n.message)"
}
Start-Sleep -Seconds 1

# -----------------------------------------------------------------------------
# STEP 6: TECHNICIAN WORKFLOW: ACKNOWLEDGE, INVESTIGATE & RESOLVE
# -----------------------------------------------------------------------------
Write-Host "`n>>> [STEP 6] TECHNICIAN INVESTIGATION & RESOLUTION WORKFLOW" -ForegroundColor Yellow
$techAuth = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body (@{ username = "tech.network"; password = "Tech@123" } | ConvertTo-Json) -ContentType "application/json"
$techHeaders = @{ Authorization = "Bearer $($techAuth.token)"; "Content-Type" = "application/json" }

# Transition to ACKNOWLEDGED
Write-Host "Technician acknowledging ticket (records respondedAt timestamp for SLA)..."
$ackPayload = @{ newStatus = "ACKNOWLEDGED" } | ConvertTo-Json
$ackInc = Invoke-RestMethod -Uri "http://localhost:8080/api/incidents/$incId/status" -Method Patch -Body $ackPayload -Headers $techHeaders
Write-Host "? Incident Status: $($ackInc.status) | Responded At: $($ackInc.respondedAt)" -ForegroundColor Green

# Add Investigation Note
Write-Host "Technician adding investigation diagnostic note..."
$notePayload = @{ content = "Root cause identified: Core switch in server room B tripped power breaker. Backup UPS activated."; noteType = "INVESTIGATION"; visibleToEmployee = $true } | ConvertTo-Json
$noteRes = Invoke-RestMethod -Uri "http://localhost:8080/api/incidents/$incId/notes" -Method Post -Body $notePayload -Headers $techHeaders
Write-Host "? Investigation Note Appended to Ticket" -ForegroundColor Green

# Transition to IN_PROGRESS
Write-Host "Technician moving incident to IN_PROGRESS..."
$inProgPayload = @{ newStatus = "IN_PROGRESS" } | ConvertTo-Json
$inProgInc = Invoke-RestMethod -Uri "http://localhost:8080/api/incidents/$incId/status" -Method Patch -Body $inProgPayload -Headers $techHeaders
Write-Host "? Incident Status: $($inProgInc.status)" -ForegroundColor Green

# Transition to RESOLVED with details
Write-Host "Technician resolving incident with official resolution details..."
$resolvePayload = @{
    newStatus         = "RESOLVED"
    resolutionDetails = "Reset switch circuit breaker, rerouted power to secondary PDU, verified full WiFi throughput and VPN tunnel handshake."
} | ConvertTo-Json
$resolvedInc = Invoke-RestMethod -Uri "http://localhost:8080/api/incidents/$incId/status" -Method Patch -Body $resolvePayload -Headers $techHeaders
Write-Host "? Incident Status: $($resolvedInc.status)" -ForegroundColor Green
Write-Host "   • Resolved At: $($resolvedInc.resolvedAt)"
Write-Host "   • Resolution : $($resolvedInc.resolutionDetails)"
Start-Sleep -Seconds 1

# -----------------------------------------------------------------------------
# STEP 7: EMPLOYEE VERIFICATION, FEEDBACK RATING & TICKET CLOSURE
# -----------------------------------------------------------------------------
Write-Host "`n>>> [STEP 7] EMPLOYEE VERIFICATION & FEEDBACK RATING" -ForegroundColor Yellow
Write-Host "Alice verifies WiFi is back online and confirms ticket resolution..."
$verifyPayload = @{ newStatus = "VERIFIED" } | ConvertTo-Json
$verifiedInc = Invoke-RestMethod -Uri "http://localhost:8080/api/incidents/$incId/status" -Method Patch -Body $verifyPayload -Headers $empHeaders
Write-Host "? Incident Status: $($verifiedInc.status)" -ForegroundColor Green

Write-Host "Alice submits 5-star resolution feedback..."
$feedbackPayload = @{ rating = 5; comment = "Fastest resolution ever! WiFi and VPN are working flawlessly now. Thank you Alex!" } | ConvertTo-Json
$fbRes = Invoke-RestMethod -Uri "http://localhost:8080/api/feedback/incident/$incId" -Method Post -Body $feedbackPayload -Headers $empHeaders
Write-Host "? Feedback Recorded: Rating $($fbRes.rating)/5 Stars - '$($fbRes.comment)'" -ForegroundColor Green

# Transition to CLOSED
Write-Host "Archiving and closing incident..."
$closePayload = @{ newStatus = "CLOSED"; closureNotes = "Service restored within SLA target. Verified and closed." } | ConvertTo-Json
$closedInc = Invoke-RestMethod -Uri "http://localhost:8080/api/incidents/$incId/status" -Method Patch -Body $closePayload -Headers $adminHeaders
Write-Host "? Final Lifecycle State Reached: $($closedInc.status) at $($closedInc.closedAt)" -ForegroundColor Green
Start-Sleep -Seconds 1

# -----------------------------------------------------------------------------
# STEP 8: ADMINISTRATOR DASHBOARD METRICS & ANALYTICS
# -----------------------------------------------------------------------------
Write-Host "`n>>> [STEP 8] ADMINISTRATOR METRICS & SYSTEM HEALTH CHECK" -ForegroundColor Yellow
$stats = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/reports/dashboard" -Method Get -Headers $adminHeaders
Write-Host "? Live Administrative Aggregates:" -ForegroundColor Green
Write-Host "   • Total Incidents Logged   : $($stats.totalIncidents)"
Write-Host "   • Currently Open Incidents : $($stats.openIncidents)"
Write-Host "   • Critical Incidents (P1)  : $($stats.criticalIncidents)"
Write-Host "   • Resolved & Closed Tickets: $($stats.resolvedIncidents)"
Write-Host "   • SLA Breaches             : $($stats.slaBreaches)"

$workload = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/reports/workload" -Method Get -Headers $adminHeaders
Write-Host "`n? Real-Time Technician Workload Balancing:" -ForegroundColor Green
foreach ($w in $workload) {
    Write-Host "   • $($w.name) ($($w.specialization)): Active Incidents = $($w.activeIncidents) | Available = $($w.available)"
}

Write-Host "`n================================================================================" -ForegroundColor Cyan
Write-Host "                     AUTOMATED DEMO COMPLETED SUCCESSFULLY!                     " -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan
