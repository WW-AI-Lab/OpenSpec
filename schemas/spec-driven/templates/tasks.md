## 1. <!-- 任务分组名称 -->

- [ ] 1.1 <!-- 任务描述；标明依赖、上下文输入和完成标准。 -->
- [ ] 1.2 <!-- 任务描述；若可并发，说明可由 sub-agent 独立完成。 -->

## 2. Parallelization Plan

- [ ] 2.1 <!-- 标注可并发任务组、共享上下文文件、预期 sub-agent 产出和主 agent 汇总方式；若不适合并发，说明原因。 -->
- [ ] 2.2 <!-- 为测试、基础调研、影响面分析或独立实现切片规划 sub-agent 委派；明确哪些任务必须由主 agent 顺序完成。 -->

## 3. Architecture Verification

- [ ] 3.1 <!-- 根据 design.md 的 Architecture Assessment 增加必要验证，例如 contract/integration/e2e、lint/static check、迁移兼容或回滚验证；优先规划可由 sub-agent 并发执行的验证，不适用时说明原因。 -->
