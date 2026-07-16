# 文件格式

## 扩展名

`.nav`

## 编码

UTF-8，新文件建议使用 Unix 换行（`\n`），格式化工具规范化空白，不改变编码。

## 命名

parser 不解释文件名，路径应便于导航与 Git 审阅。

## 工作区根

传给 `nav serve`、`nav build`、`nav format` 的任意目录，递归加载根下所有 `.nav` 文件。

## 忽略的内容

- 空行
- 首字符为 `;` 的行（注释）

## 指令边界

新指令从无缩进的 `YYYY-MM-DD` 行开始，续行两空格缩进。

## 格式化约定

`nav format` 与 VS Code 扩展：

- 元数据、posting、正文两空格缩进
- 指令之间空行
- posting 列对齐

格式化不重排指令、不改数字字面量。

## 相关

- [文件](../language/files.zh.md)
- [nav format](../cli/format.zh.md)
