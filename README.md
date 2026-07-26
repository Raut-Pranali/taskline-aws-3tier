# Taskline — Task Manager (AWS 3-Tier App)

A minimal full-stack to-do app, built as the **application payload** for a
highly available, secure 3-tier AWS architecture (Route 53 → WAF → ALB →
Auto Scaling Group → RDS Multi-AZ, with SSM/Bastion admin access).

The app is intentionally simple — the real project is the infrastructure
around it.

## Stack

- **Frontend:** React + Vite, served as static files (via Nginx on EC2, or S3+CloudFront)
- **Backend:** Node.js + Express REST API
- **Database:** PostgreSQL (RDS Multi-AZ in production)

## Run locally

**1. Database**
```bash
createdb todoapp
psql -d todoapp -f backend/schema.sql
```

**2. Backend**
```bash
cd backend
cp .env.example .env   # edit with your local DB credentials
npm install
npm run dev             # http://localhost:4000
```

**3. Frontend**
```bash
cd frontend
npm install
npm run dev              # http://localhost:5173
```

The frontend calls the API at `http://localhost:4000` by default. Override
with a `.env` file containing `VITE_API_URL=http://localhost:4000` if needed.

## API

| Method | Path              | Description        |
|--------|-------------------|---------------------|
| GET    | /api/health       | Health check (used by ALB target group) |
| GET    | /api/tasks        | List all tasks     |
| POST   | /api/tasks        | Create a task       |
| PATCH  | /api/tasks/:id    | Update a task (toggle done, edit)       |
| DELETE | /api/tasks/:id    | Delete a task       |

## Deploying onto the AWS architecture

1. **RDS**: create a PostgreSQL Multi-AZ instance in your DB-only private
   subnet. Run `backend/schema.sql` against it (via a bastion/SSM tunnel,
   since it has no public access).
2. **EC2 (app tier, private subnet, in the Auto Scaling Group)**:
   - Install Node.js via user-data
   - Pull this repo (or bake into an AMI)
   - Set env vars (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_SSL=true`, etc.)
     via SSM Parameter Store / Secrets Manager, not hardcoded
   - Run backend with a process manager (e.g. `pm2`) behind Nginx on port 80,
     proxying to the Express app on 4000
   - Build the frontend (`npm run build`) and serve `dist/` via the same
     Nginx, or push to S3 + CloudFront for a cleaner split
3. **ALB**: target group health check → `/api/health`; listener on 80/443
4. **WAF**: attach an AWS managed rule set (Core rule set + known bad inputs)
   to the ALB
5. **Auto Scaling Group**: launch template built from the EC2 setup above;
   scale on target tracking (e.g. CPU 60%)
6. **Admin access**: use SSM Session Manager instead of a public bastion
   where possible — no open SSH port needed
7. **Route 53**: point your domain's A record (alias) at the ALB

## Demo checklist (for interviews / recording a walkthrough)

- [ ] Hit the ALB DNS name / your domain, confirm the app loads and tasks CRUD works
- [ ] Terminate one EC2 instance manually, watch ASG replace it automatically
- [ ] Trigger a WAF managed rule (e.g. a basic SQLi-looking query string) and confirm it's blocked
- [ ] Force an RDS failover (reboot with failover) and confirm the app recovers
- [ ] Show CloudWatch metrics/alarms tied to the ASG scaling policy
