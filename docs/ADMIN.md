# 个人资料管理

线上管理页：[GitHub Pages 管理页](https://pxifer.github.io/PersonalSite/admin/)

1. 在 GitHub 创建精细权限个人访问令牌（Fine-grained personal access token）。Repository access 只选择 `pxifer/PersonalSite`，Repository permissions 中仅将 **Contents** 设为 **Read and write**，并设置较短有效期。
2. 打开管理页，输入令牌并点击“加载当前资料”。不要把令牌发给他人，也不要把它提交到仓库。
3. 修改个人资料、社交链接、技能或经历，点击“保存并发布”。这会直接提交到 `main` 分支；[Actions](https://github.com/pxifer/PersonalSite/actions) 检查和部署成功后，网站才会更新。
4. 若提示资料冲突，重新加载最新内容后再编辑。结束时点击“清除令牌”或关闭页面。

管理页不提供项目和博客编辑。它是公开可打开的静态页面，`noindex` 并不限制访问；实际写入权限由 GitHub 令牌决定。页面代码不会把令牌存入 localStorage、sessionStorage、URL 或仓库。
