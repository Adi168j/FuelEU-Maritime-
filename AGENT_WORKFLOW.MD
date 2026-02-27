# AI Agent Workflow Log

## Agents Used

To build this Hexagonal Architecture system efficiently, I utilized a multi-agent approach, selecting specific tools based on the complexity of the task:

- **Cursor Chat (Claude 3.5 Sonnet):** My primary architectural assistant. Used for iterative problem-solving, debugging backend Express routing, and refining domain logic.
- **Cursor Composer:** Used for rapid, multi-file generation, such as wiring repository adapters to the Express controllers and generating boilerplate TypeScript types.
- **Claude 3.5 Sonnet (Web):** Used strictly for isolating and solving the complex mathematical requirements of FuelEU Article 21 (Pooling).
- **v0.dev (by Vercel):** Used for generating the initial React + Tailwind CSS table layouts.
- **GitHub Copilot:** Used inside the IDE for inline code completions and rapidly writing repetitive unit test cases.

---

## Prompts & Outputs(EXAMPLES)

### Example 1: Enforcing Baseline Logic & Hexagonal Constraints (Generation)

**My Prompt (Cursor Chat):**

> "We need to improve the baseline logic for routes in our FuelEU Maritime backend + frontend. Context: Hexagonal Architecture (controllers -> use cases -> domain -> repository port -> postgres adapter). Current problem: Multiple routes can have `is_baseline = true`. 
> 
> Required changes:
> 1. Update setBaseline logic so that it first sets `is_baseline = false` for ALL routes, then sets `is_baseline = true` for the selected route in a single transaction.
> 2. Add a DELETE endpoint (`DELETE /routes/:id/baseline`).
> 3. **Constraint:** Ensure business logic remains strictly in the application/use-case layer. The controller should only handle HTTP concerns. Absolutely no SQL inside the controller. Keep separation of concerns clean. Show the updated controller method, repository adapter, and frontend API client."

**Generated Snippet (Repository Adapter Output):**
```typescript
async setBaseline(routeId: string): Promise<void> {
  const client = await this.pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('UPDATE routes SET is_baseline = false');
    await client.query('UPDATE routes SET is_baseline = true WHERE route_id = $1', [routeId]);
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}
```

### Example 2: Data Integrity & Upsert Logic (Correction)

**My Prompt (Cursor Chat):**
> "Each time I call GET /compliance/cb for the same ship and year, a new row is inserted into ship_compliance. This should behave like a snapshot or upsert instead. Help me implement a proper ON CONFLICT upsert and add the appropriate unique constraint."

**Output/Correction:** The AI successfully provided the SQL migration for a `UNIQUE (ship_id, year)` constraint and refactored the Postgres adapter to use `INSERT INTO ... ON CONFLICT (ship_id, year) DO UPDATE SET cb_gco2eq = EXCLUDED.cb_gco2eq`.

---

## Example Prompts Showing Critical Thinking & Debugging

During integration, I used highly specific prompts to systematically debug issues rather than relying on the AI to blindly "fix" the code:

**Systematic Debugging:** 
> "The Compare, Banking, and Pooling tabs return 404 while the Routes tab works. Please help me systematically debug this: Confirm the routes are defined. Confirm controllers are mounted in server.ts. Check for route-ordering or param conflicts. Confirm the server is running the latest compiled code. Help me isolate the root cause step by step."

**Methodical Testing:** 
> "Before assuming backend logic is wrong, let's test each failing endpoint using curl and record the raw responses. Then compare with what the frontend expects. I want to clearly separate server-side 404s from frontend routing or fetch issues."

**Deployment Awareness:** 
> "GET /routes works but /routes/comparison returns 404 even though the code exists. Could the running backend process be serving an older build? Help me confirm whether the server needs restarting and how to safely stop and restart the correct process."

**Precision Awareness:** 
> "The percentDiff and Compliance Balance values are returning long floating-point decimals, which makes the UI messy and could cause test instability. How should I handle rounding properly while preserving calculation accuracy? Should formatting happen in the domain layer or presentation layer?"

---

## Validation / Corrections (Challenges Faced)

I systematically verified and corrected agent outputs, particularly when dealing with runtime environments and edge cases. Here are the specific challenges faced and how they were resolved:

### 1. HTTP 404 on Newly Added Endpoints & Stale Backend Process

**Problem:** Endpoints like `GET /routes/comparison` and `GET /compliance/cb` returned 404, while `GET /routes` worked correctly. Controllers were defined and mounted.

**Root Cause:** The backend process running on port 3000 was serving older compiled code. The server had not been restarted after adding new routes.

**Resolution:** Identified the process using port 3000, killed the old process, and restarted the server cleanly. This reinforced that deployment state matters as much as code correctness.

### 2. Route Matching Order Concerns

**Problem:** There was concern that Express was capturing `/routes/comparison` under the dynamic `/routes/:id` parameter route.

**Resolution:** Verified HTTP methods and re-registered `/routes/comparison` before the parameterized routes in the controller. Confirmed no unintended matching, preventing subtle production bugs.

### 3. Port 3000 Already in Use

**Problem:** The new server would not start because port 3000 was already occupied by a phantom Node process.

**Resolution:** Identified the PID, terminated it via the terminal, and restarted the server cleanly.

### 4. PowerShell Syntax Differences

**Problem:** The AI suggested running `npm run build && npm run dev`. The `&&` operator failed in my older PowerShell environment.

**Resolution:** I manually corrected the command to `npm run build; npm run dev`. Lesson: Shell environment differences affect developer experience and AI suggestions must be locally adapted.

### 5. Numeric Precision & Floating-Point Drift

**Problem:** Calculations returned long decimals like `1234.5678912345678`, making the UI messy and comparisons inconsistent due to standard JS floating-point precision behavior.

**Resolution:** Applied rounding strictly in the presentation/use-case layer (e.g., `Number(value.toFixed(4))`), keeping internal math precise but formatting the response properly.

### 6. Duplicate Compliance Records (Upsert Issue)

**Problem:** The generated codebase lacked idempotency. Fetching compliance snapshots resulted in duplicate rows in `ship_compliance`.

**Resolution:** Enforced a unique constraint on `(ship_id, year)` and implemented `ON CONFLICT (...) DO UPDATE` logic in the Postgres adapter.

---

## Observations

**Where Agent Saved Time:** Cursor Composer was exceptionally fast at scaffolding multi-file boilerplate, wiring the Express server to the Hexagonal adapters, and generating the `tsconfig.json` setups. v0.dev eliminated hours of manual CSS grid and layout tweaking.

**Where Agent Failed or Hallucinated:** AI models consistently struggle with Express route ordering (putting parameterized routes above static ones). The AI also defaulted to naive INSERT statements instead of robust UPSERT logic, and lacked awareness of my local runtime environment (stale Node processes/PowerShell syntax). Furthermore, v0.dev attempted to create a massively bloated folder structure using shadcn/ui which I had to actively prevent.

**How I Combined Tools Effectively:** I established a strict workflow: isolate complex math in Claude Web, paste the proven logic into Cursor, use Copilot to generate TDD unit tests for that logic, and then use Cursor Composer to wire the use-cases to the HTTP controllers and adapters.

---

## Best Practices Followed

**Hexagonal Architecture Strictness:** Maintained strict separation of concerns. Ensured that the Express controllers only handled HTTP requests/responses, and strictly prohibited any SQL from leaking out of the `adapters/outbound/postgres` directory.

**Test-Driven Mentality:** Designed unit tests and formulated edge cases (like negative compliance balances) before prompting Cursor to write the implementation logic.

**Methodical Isolation:** Rather than changing multiple files when an API failed, I used curl to isolate the failure to either the backend routing or the frontend React fetch client.

**Controlled UI Generation:** Explicitly constrained UI-generation tools (v0.dev) from utilizing bloated external component libraries, forcing them to output clean, single-file native HTML tables styled strictly with Tailwind utility classes to maintain repository cleanliness.