# Reflection – AI-Assisted Development

**Project:** FuelEU Maritime – Full Stack Assignment  
**Author:** Aditya Jain (Roll No. b23ES1004)  

## What I Learned Using AI Agents
As a third-year computer science student, this project significantly evolved my perspective on AI in software engineering. Initially, I approached AI primarily as a tool for rapid code generation. However, during this assignment, I learned that AI is most powerful when utilized as a structured scaffolding assistant, a debugging partner, and a brainstorming collaborator. 

The real value of AI did not come from blindly accepting generated code, but rather from the engineering discipline required to guide it. I learned that writing precise prompts, strictly constraining architectural boundaries, and critically reviewing outputs are non-negotiable skills. For example, when implementing the greedy pooling algorithm or the compliance upsert logic, the AI required multiple manual refinements to handle edge cases and enforce database idempotency. This reinforced a crucial lesson: AI augments engineering reasoning; it does not replace it.

## Efficiency Gains vs. Manual Coding
AI provided massive efficiency multipliers during the foundational phases of development. Tasks that would traditionally take hours—such as writing boilerplate TypeScript interfaces, scaffolding Express controllers, drafting SQL schemas, structuring Jest test suites, and building initial Tailwind UI layouts—were reduced to minutes. 

However, I observed that these efficiency gains were directly proportional to the clarity of my instructions. When prompts were vague, the outputs required more time to correct than to write from scratch. The most productive workflow I discovered was:
1. Define the architecture clearly beforehand.
2. Use AI to generate the boilerplate and scaffolding.
3. Manually validate and refine the business logic.
4. Prompt the AI to assist with refactoring and test coverage.

## Architectural Discipline & AI Limitations
One of the most important takeaways was maintaining separation of concerns. I consciously enforced the Hexagonal Architecture pattern (Ports and Adapters), ensuring no business logic leaked into controllers and no SQL lived outside the repository adapters. The AI occasionally attempted to mix these concerns—such as suggesting SQL transactions directly inside an Express controller. Correcting this demonstrated that architectural integrity must be controlled by the engineer, not the tool.

Furthermore, AI struggled in areas requiring deep systems awareness and domain reasoning. It lacked environmental context, such as when a stale backend process caused persistent 404 errors—a runtime issue I had to debug systematically using the terminal. It also required strict human intervention for handling floating-point precision drift in the compliance formulas and ensuring database updates were transaction-safe.

## Improvements for Future Iterations
If I were to extend this project further, I would implement the following improvements:
* **Robust Testing:** Add full integration tests for the pooling and banking workflows to complement the unit tests.
* **Request Validation:** Introduce a validation middleware (such as Zod or Joi) to ensure API payloads are strictly typed at runtime.
* **System Observability:** Improve error standardization across controllers and add structured logging middleware.
* **Deployment & UI:** Consider Dockerizing the Node backend and PostgreSQL database for easier reproducibility, and integrate a dedicated charting library (like Recharts) for a more sophisticated Compare Tab visualization.

## Final Takeaway
This assignment proved that AI is a powerful engineering multiplier when used intentionally. A clear architectural vision, precise prompting, and rigorous independent debugging are required to harness it effectively. AI accelerated the development pace significantly, but correctness, structural integrity, and reliability remained strictly my responsibility as the engineer.