# 为最强模型重新校准 OpenSpec 默认 Skills 设计

> 评估者视角说明：本文由一个前沿大模型（Fable 5 级别）撰写，评估对象是 OpenSpec 默认生成的 Skills 提示词——也就是我这类模型在实际工作时逐字读到、并被其驱动的文本。这是一份"被管理者对管理制度的一手反馈"，而不是纯外部观察。

## TL;DR

OpenSpec 的**数据模型是对的，而且会越来越对**：delta specs、artifact DAG、CLI 作为结构化事实源、archive 合并——这些是给任何代际模型都成立的"外置持久记忆 + 可验证状态"。**但默认 Skills 的提示词写法是为 2024 年代弱模型校准的**：逐步骤脚本、强制输出格式、每步回查状态、大量 MUST/NEVER 护栏、以及本 fork 新增的强制并发计划章节。对最强模型而言，这些不是安全网，而是三种真实成本：**上下文税**（挤占真正有用的项目上下文）、**判断力抑制**（把校准良好的自主判断降级为脚本合规）、**与宿主环境的指令冲突**（每个 agent 宿主自带的系统提示与 Skill 的微观管理互相打架）。

核心建议一句话：**把"过程约束"降级为"结果契约"——Skill 只声明目标、不变量和验收方式，把步骤编排还给模型；把逐 artifact 的详细指导收敛到 CLI 的 `openspec instructions` 动态通道这个唯一事实源，Skill 本身瘦身为薄路由。**

`apply` 有一个有意保留的持久状态例外：每个 task 取得验证证据后立即更新 checkbox，并重读 `tasks.md` 再选择下一项。这不是固定实现顺序，而是用仓库内的事实源同步进度并刷新剩余规划，避免长实现会话中的状态漂移。sub-agent 的具体拆分仍由运行时冲突面决定，但存在安全独立切片时应主动使用。

---

## 一、评估的假设与视角

依照默会知识原则，先把我依赖的假设说清楚：

1. **评估对象**是模型实际读到的文本：`src/core/templates/workflows/*.ts` 中的 Skill/Command 模板（约 3800 行）、`schemas/spec-driven/schema.yaml` 中的 artifact instructions、`src/core/shared/skill-generation.ts` 中注入的 `references/architecture-guidance.md`。不是 CLI 实现，也不是文档。
2. **目标用户模型**取 README 自己声明的定位："OpenSpec works best with high-reasoning models. We recommend Codex 5.5 and Opus 4.7"。既然官方推荐的就是最强模型，那么默认 Skills 应当为最强模型校准，弱模型兜底可以作为可选档位，而不是反过来。
3. **宿主环境是既定事实**：Skills 运行在 Cursor、Claude Code 等宿主内，宿主自带的系统提示已经规定了沟通风格、自主性边界、todo 管理、并行工具调用、何时向用户提问。Skill 与宿主指令重复或冲突时，冲突本身就是成本。
4. **本 fork 的定制**（默认中文、架构指导、强制并发计划）视为设计的一部分一并评估。

---

## 二、OpenSpec 设计思想的内核：哪些部分恰恰是"越强的模型越受益"

先说应该坚决保留、甚至加强的部分。这些不是妥协，而是对强模型真正的增益：

### 1. 外置持久记忆（specs/ 作为事实源）

模型的上下文窗口是易失的，跨会话、跨 change 的行为契约必须外置。`openspec/specs/` + delta 合并机制解决的是**模型能力再强也无法解决**的问题：会话之间的记忆连续性。这是 OpenSpec 相对"纯 prompt 工作流"的根本价值，与模型强弱无关。

### 2. Delta specs 的 brownfield 表达

"只描述变化"完全契合强模型的工作方式——我在读一个 change 时想知道的正是"什么变了"，而不是重新读全量 spec。ADDED/MODIFIED/REMOVED/RENAMED 的结构化格式还让 archive 合并可机械执行、可校验。**这个格式约束是值得付出的约束**，因为它换来了可验证性。

### 3. CLI 作为结构化事实源

`openspec status --json` / `openspec instructions --json` 提供了不依赖模型记忆的 ground truth。文件系统存在性即状态（BLOCKED → READY → DONE），没有隐藏状态机。对强模型来说，这是理想的协作接口：**我可以随时廉价地校准自己对世界的认知**。

### 4. "依赖是 enabler 不是 gate" 的哲学

`docs/opsx.md` 中"actions not phases"的定位是对的，与强模型的工作方式天然契合——真实工作是非线性的，实现中发现设计错误应该直接回去改 design 而不是被 phase gate 挡住。

### 5. Schema 可定制、提示词外置

从"硬编码在 TypeScript 里"走向"schema.yaml + templates 可编辑"是正确的方向，它让提示词迭代不再依赖发版。本文的所有建议之所以可行，正是因为这层机制已经存在。

**小结**：OpenSpec 的骨架（数据模型、状态模型、CLI 契约）是 model-proof 的。问题全部集中在肌肉层——Skills 提示词的写法。

---

## 三、问题诊断：默认 Skills 与最强模型的六个错配

### 错配 1：逐步骤微观脚本 vs. 目标驱动执行

**现状**：几乎每个 Skill 都是 imperative 脚本。以 `propose` 为例：Step 1 问用户 → Step 2 跑 `openspec new change` → Step 3 跑 `status --json` 解析字段 → Step 4a 对每个 ready artifact 跑 `instructions --json`、读依赖、写文件、**每写完一个 artifact 重新跑一遍 `status --json`** → Step 5 展示最终状态。`apply` 是 8 步，`archive` 是 6 步。

**问题**：
- 对最强模型，"创建一个 change 并产出 applyRequires 所需 artifacts，用 CLI 获取指令和路径"一句话 + JSON 字段说明就足够了。步骤编排恰恰是强模型最擅长自己做的事。
- 脚本化提示词产生**脚本合规行为**：当现实偏离脚本（比如 artifact 已部分存在、用户中途改需求），弱模型需要脚本兜底，强模型却会被脚本卡住——"步骤说要重新跑 status，虽然我刚写完文件、状态显然已知"。每 artifact 一次的状态回查是纯粹的 token/延迟开销，文件系统即状态，我刚写完的文件我知道它存在。
- 步骤脚本还隐式假设了串行执行。强模型宿主普遍支持并行工具调用，`specs` 和 `design` 在 DAG 上本就互不依赖，但 Step 4 的 loop 语义引导逐个串行创建。

**方向**：Skill 声明**契约**而非**流程**。契约 = 目标（何为完成）+ 不变量（什么绝不能破坏）+ 工具（CLI 命令及其 JSON 语义）。例如：

```markdown
目标：使 change 达到 apply-ready（applyRequires 中所有 artifact 状态为 done）。
不变量：
- 每个 artifact 用 `openspec instructions <id> --change <name> --json` 获取模板与输出路径，写入 resolvedOutputPath；
- 写作前读取其依赖 artifact；context/rules 是给你的约束，不进入产出文件；
- delta spec 的 ## ADDED/MODIFIED/REMOVED headers 与 #### Scenario 层级不可改动（archive 解析依赖它）。
其余编排（顺序、并行、是否需要中途确认）由你判断。
```

### 错配 2：强制输出格式与宿主沟通风格冲突

**现状**：`apply` Skill 规定了三套逐字输出模板（"## Implementing: ..."、"## Implementation Complete"、"## Implementation Paused"），`archive` 规定了 "## Archive Complete" 块，`propose` 规定了收尾话术（"Run \`/opsx:apply\` to start implementing."）。

**问题**：每个宿主的系统提示都有自己的沟通规范（Cursor 要求"结论先行、散文体、少用标题"；Claude Code 有另一套）。Skill 强制的 markdown 输出块与宿主规范直接冲突，模型要么违反宿主、要么违反 Skill，两边都是"指令未被遵循"。而且这些格式块占了 Skill 文本的 1/4 以上。

**方向**：只声明**信息义务**，不声明渲染格式："完成或暂停时，向用户报告：change 名称、进度 N/M、本次完成项、下一步建议。格式遵循宿主环境的沟通规范。"

### 错配 3：为弱模型设计的硬护栏抑制强模型的校准判断

**现状**：大量绝对化护栏——`archive`："Do NOT guess or auto-select a change. Always let the user choose"；`propose`："IMPORTANT: Do NOT proceed without understanding..."；`apply`："Pause on errors, blockers, or unclear requirements - don't guess"。

**问题**：这些护栏假设模型不会校准提问时机。但强模型宿主明确要求"能行动就行动，不要用问题阻塞可自主决定的事"。结果是：只有一个 active change 时 `apply` 允许自动选择，`archive` 却强制询问——同一状况两套规则，唯一的解释是写作时对模型的不信任程度不同。"Pause on errors"更是反模式：强模型遇到错误的正确行为是**尝试修复并重试**，把每个错误都升级给用户是弱模型行为。

**方向**：把硬护栏改写为**判断标准**，只保留真正不可逆/超出授权范围的硬停止：
- 硬停止（保留）：archive 的目录移动、specs 合并这类不可逆操作前，若存在未完成任务需确认；workspace-planning 模式下不得编辑 linked repos。
- 判断标准（替换）："当歧义会导致返工成本高于一次提问时才提问；错误优先自行修复，仅在连续失败或需要用户决策时上报。"

### 错配 4：同一指导内容的四重冗余注入

**现状**：架构指导（复用优先、边界、质量属性、验证任务）同时存在于：① `references/architecture-guidance.md`（挂 6 个 Skill）；② 每个 Skill 正文的 "**Architecture Guidance**" 段；③ 每个 Command 模板的 "**Architecture Checklist**" 段；④ `schema.yaml` 中 proposal/design/tasks 三个 artifact 的 instruction。语言规范（"默认简体中文，标识符保持英文"）同样在每个 Skill、每个 Command、每个 artifact instruction 中各重复一遍。

**问题**：对强模型，同一约束说一遍就会被遵守；说四遍只有第一遍有边际收益，其余三遍是纯上下文税，且四处副本会随迭代**漂移不一致**（已经发生：Skill 版说"先阅读 references/architecture-guidance.md 如果可用"，Command 版是内嵌精简版，schema 版又是第三种表述）。上下文预算是零和的——这些重复挤占的正是本可以放项目真实上下文（config.yaml 的 context、现有 specs 摘要）的空间。

**方向**：**单一事实源 + 按需加载**。架构指导只保留 references 一份完整版；Skill 正文只留一行指针；schema instruction 只保留该 artifact 特有的增量要求（如 design.md 的 Architecture Assessment 章节结构）。语言规范收敛到 `config.yaml` 的 context 注入（该机制本就存在且设计目的正是于此）。

### 错配 5：强制并发计划——把运行时决策错误地固化为规划产物

**现状**（本 fork 新增）：`tasks.md` 模板强制包含 "## 2. Parallelization Plan" 章节；propose/apply 的 Skill 与 Command、schema 的 tasks instruction 和 apply instruction 全部要求规划 sub-agent 委派、context inputs、读写边界、汇总方式。

**问题**：这是六个错配中方向性错误最明确的一个。
- **并发是执行时决策，不是规划时产物**。能否并行取决于 apply 时刻的宿主能力（有无 Task 工具、sub-agent 配额）、实际文件冲突面、当时的任务余量。planning 时刻写下的并发计划到 apply 时大概率过时，而强模型在 apply 时刻本来就会即时判断"这几个任务互不相干，可以并行"。
- **对小变更是纯仪式**。一个 3 任务的 bug fix 也被要求产出并发计划章节和架构验证章节，这直接违背 OpenSpec 自己的哲学（easy not complex）和 concepts.md 的 progressive rigor。
- 让模型在 tasks.md 里为假想的 sub-agent 写"允许读取/编辑范围、预期产出、汇总方式"，是让规划文档承担 orchestration framework 的职责——产物变重，收益却在执行时归零。

**方向**：从 tasks.md 模板中移除强制章节，把并发判断留在 apply 运行时。apply 应在每轮主动识别安全独立切片，并在存在这类切片时使用 sub-agent；具体分组、数量和时机仍由当时的文件与契约冲突面决定，共享边界、最终集成、验证和 checkbox 保持主 agent 所有。仅当变更本身规模大到需要跨会话或跨团队协作时，才在 design.md 中固化分工——这是"按显著性调整深度"，而不是无条件制造规划章节。

### 错配 6：DAG 硬依赖与"design 可选"的自相矛盾

**现状**：`schema.yaml` 中 design 的 instruction 写着"何时需要 design.md（任一条件满足即创建）"，暗示 design 是有条件产物；`docs/concepts.md` 明确说 "You can skip design if you don't need it"。但 DAG 定义 `tasks.requires: [specs, design]`、`apply.requires: [tasks]`——**design 实际上是硬依赖**，propose 的 Guardrail 又要求 "Create ALL artifacts needed for implementation"。

**问题**：文档承诺的弹性在默认 schema 中不存在。结果是每个 trivial change 都会产出一份凑数的 design.md——强模型会忠实地把"不需要设计的变更"也写出一篇像样的设计文档，这恰恰是强模型被流程浪费的典型形态：**能力越强，把仪式做得越像真的，浪费越隐蔽**。

**方向**：让 schema 表达真实语义。两个可选路径：
1. 引入可选依赖语义（如 `requires: [specs]` + `enhances: [design]`），tasks 只硬依赖 specs；
2. 或提供一个内置的 `spec-lite` schema（proposal → tasks），由 propose 时刻根据变更规模选择 schema——这利用了已有的多 schema 机制，改动最小。

配套地，propose Skill 增加一个**规模判断**入口："先评估变更的架构显著性；trivial 变更走最小 artifact 集，显著变更走完整集。判断依据：是否跨模块、是否改共享契约、是否涉及迁移/安全/性能。"

---

## 四、重述设计原则：为最强模型写 Skills

把上面的诊断收敛为五条可操作的设计原则，建议作为 Skills 迭代的评审标准：

1. **契约优先于流程**（Contract over Procedure）
   Skill 声明：目标状态、不可破坏的不变量、可用工具及其语义、验收方式。不声明步骤顺序、不声明输出格式、不声明何时回查状态。

2. **单一事实源，动态下发**（One Source, Served Just-in-Time）
   OpenSpec 已经拥有一个被低估的架构优势：`openspec instructions --json` 是**动态指令通道**。逐 artifact 的写作指导应该全部收敛到 schema instruction 由 CLI 按需下发，SKILL.md 瘦身为"何时用我 + 契约 + CLI 入口"的薄路由（目标 50 行以内）。这同时解决冗余、漂移和上下文税三个问题，而且完全在现有机制内。

3. **验证换自由**（Verification buys Autonomy）
   对强模型，安全感的正确来源不是过程合规而是**结果可验证**。把提示词预算从"怎么做"转移到"怎么验收"：`openspec validate` 通过、delta 格式可被 archive 解析、spec 的每个 scenario 可映射到测试、tasks checkbox 与实际完成一致。验收标准越硬，过程约束就可以越松。

4. **深度与显著性成正比**（Progressive Rigor, Encoded）
   progressive rigor 目前只活在文档里，应该编码进默认路径：规模判断决定 artifact 集与指导深度。小变更的完整生命周期应该在 5 分钟内走完且不产出任何凑数文档。

5. **尊重宿主**（Host-Aware by Default)
   Skill 不与宿主系统提示竞争沟通风格、提问策略、todo 管理和并行策略的管辖权。凡宿主已管的，Skill 不重复；凡 Skill 必须管的（OpenSpec 特有格式、不可逆操作），用最小篇幅管。

---

## 五、具体改进建议（按优先级）

### P0 — 高收益、低风险、纯删减

| 建议 | 落点 | 预期效果 |
|---|---|---|
| 移除 tasks.md 模板中的强制 Parallelization Plan 章节，把安全切片识别与 sub-agent 使用保留为 apply 的运行时义务 | `schemas/*/templates/tasks.md`、`schema.yaml`、propose/apply 模板 | 小变更产物立即变轻；消除静态规划/动态执行错位 |
| 删除所有 Skill 中的强制输出格式块，改为信息义务声明 | `workflows/*.ts` 各模板 | 消除宿主冲突；Skill 体积约减 25% |
| 语言规范与架构指导去重：各保留一份权威版本，其余改为指针 | `skill-generation.ts`、`schema.yaml`、各 workflow 模板 | 消除漂移；显著降低上下文税 |
| 删除"每写完一个 artifact 重跑 status"的要求，改为"开始与收尾各校准一次，中途按需" | propose/ff/continue 模板 | 减少无效 CLI 往返 |

### P1 — 中等改动，重塑 Skill 形态

| 建议 | 落点 | 说明 |
|---|---|---|
| Skills 从步骤脚本重写为契约式（目标+不变量+工具+验收），目标每个 SKILL.md ≤ 50 行 | 全部 `workflows/*.ts` | 详细指导下沉到 schema instruction 由 CLI 下发；可先试点 propose 和 apply 两个最高频 Skill，用真实任务对比产出质量 |
| 护栏分级：不可逆操作保留硬停止，其余改判断标准；统一 change 自动选择规则（唯一 active change 一律自动选） | apply/archive/propose 模板 | 与强模型宿主的自主性规范对齐 |
| propose 增加规模判断入口，接通最小 artifact 路径 | propose 模板 + 新增 `spec-lite` schema 或可选依赖语义 | 让 progressive rigor 从文档变成默认行为 |
| 架构指导改为"按显著性触发"：trivial 变更只需一行复用确认；显著变更才展开 Architecture Assessment | `architecture-guidance.md` 开头增加适用性分级 + design instruction | 保留本 fork 架构治理的价值，去掉无差别税 |

### P2 — 值得探索的方向

1. **能力档位**：`config.yaml` 增加如 `agent_profile: frontier | standard`，生成 Skills 时选择契约式精简版或脚本式详尽版。默认 frontier（与 README 的模型推荐一致），为确需手把手的环境保留 standard。考虑到多一档模板的维护成本，建议先完成 P0/P1 观察效果，再决定是否需要双档。
2. **验收前移**：在 `openspec instructions apply` 的 JSON 中增加机器可读的验收清单（如 specs 的 scenario 列表），让 apply 结束时模型可以逐条自检"每个 scenario 是否有对应实现/测试"，把 verify 的核心价值内嵌进 apply 收尾。
3. **利用动态通道做上下文裁剪**：`instructions` 下发时根据变更元数据（涉及文件数、是否触碰共享模块）动态裁剪指导深度——CLI 比静态提示词更适合做这类条件逻辑。

### 不建议做的事

- **不动数据模型**：delta 格式、DAG、archive 合并、CLI JSON 契约保持不变，它们是价值所在。
- **不移除结构化格式约束**：`### Requirement:`、`#### Scenario:`、ADDED/MODIFIED headers 换来了可验证性，是"值得付出的约束"。
- **不把"给模型更多自由"理解为"删掉验收"**：方向恰恰相反——收紧验收，放松过程。

---

## 六、成功标准

迭代是否有效，用以下可检查的标准衡量：

1. **上下文效率**：单个 SKILL.md 体积下降 ≥ 60%；同一约束在全套生成物中只出现一次。
2. **小变更成本**：一个 3 任务量级的 bug fix 从 propose 到 archive，产出的凑数文档为零（无空洞 design.md、无仪式性并发章节）。
3. **产出质量不回退**：用 3-5 个真实变更做 A/B（旧脚本式 vs 新契约式 Skills），对比 proposal/specs/design 的质量与 `openspec validate` 通过率——这是 OPSX "可独立测试每个 artifact 指令"机制的直接应用场景。
4. **冲突消除**：新 Skills 在 Cursor 与 Claude Code 下运行时，不再出现"Skill 输出格式与宿主沟通规范二选一"的情形。
5. **强模型行为特征**：观察 apply 会话——错误是否被自行修复而非无差别上报、无依赖任务是否被并行处理、唯一 active change 是否被自动选择。

## 七、留给维护者的待决问题

1. 弱模型兜底是否仍是本 fork 的目标？如果是，双档模板的维护成本是否可接受，还是接受"默认面向强模型、弱模型效果自然下降"？
2. 最小 artifact 路径采用哪种实现：可选依赖语义（改 artifact-graph 引擎）还是 `spec-lite` schema（零引擎改动）？后者改动小但把选择负担放在了 propose 时刻。
3. 架构指导的"显著性触发"阈值由谁判断：模型自判（信任判断力）还是 CLI 依据变更元数据判断（可审计）？
4. 上游（Fission-AI/OpenSpec）与本 fork 的 Skills 演进如何同步？契约式重写会显著增大与上游模板的 diff 面。
