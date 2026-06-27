## 1. Workspace Planning

- [ ] 1.1 确认 shared product goal 和 unresolved scope questions。
- [ ] 1.2 使用 registered workspace link names 识别 affected areas。
- [ ] 1.3 在选择 implementation areas 前，Review workspace-scoped specs 和 design。
- [ ] 1.4 确认跨 area 边界、owner、handoff 和共享约束。
- [ ] 1.5 规划 sub-agent 使用方式：哪些 affected area、基础调研、验证或证据收集可并发，哪些必须由主 agent 汇总决策。

## 2. Parallel Coordination

- [ ] 2.1 为每个可并发 affected area 标明 context inputs、allowed read scope、预期 sub-agent output 和合并/冲突处理方式。
- [ ] 2.2 将可并发的系统调研、依赖分析、测试设计或验证证据收集分配给 sub-agent；主 agent 保留架构取舍和最终 checklist 更新职责。
- [ ] 2.3 标明跨 area handoff 的顺序门槛，避免 sub-agent 同时修改同一 owner、contract 或共享配置。

## 3. Affected Area Implementation

- [ ] 3.1 选择 affected area，并在 implementation 前确认 allowed edit root。
- [ ] 3.2 只在 area 被选择后创建或更新 repo-local implementation artifacts。
- [ ] 3.3 将 area-specific 架构约束转化为后续 repo-local OpenSpec change 或实现任务。

## 4. Verification

- [ ] 4.1 验证 workspace planning artifacts 仍是 source of truth。
- [ ] 4.2 验证 design 中的跨 area 架构约束、handoff 和 rollback/compatibility 要求。
- [ ] 4.3 记录 manual acceptance evidence 和 follow-up fixes；可并发验证时由 sub-agent 收集证据，主 agent 汇总结论。
