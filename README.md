# 小兔子厨房用户端

小兔子厨房用户端是面向顾客和家庭厨房场景的 uni-app 微信小程序。用户可以浏览菜品分类、查看菜品详情、选择用餐方式、提交订单、查看订单和参与分享广场，和后端服务、管理后台共同组成三端私房菜点单系统。

## 技术栈

- uni-app
- Vue 3
- 微信小程序
- HBuilderX
- uni.request / uni.uploadFile
- 本地缓存 `uni.getStorageSync` / `uni.setStorageSync`

## 关联仓库

| 子项目 | 仓库 | 说明 |
| --- | --- | --- |
| 后端服务 | [xiaotuzi-kitchen-backend](https://github.com/jiangyi3265/xiaotuzi-kitchen-backend) | Spring Boot API、权限、订单和业务数据 |
| 管理后台 | [xiaotuzi-kitchen-admin](https://github.com/jiangyi3265/xiaotuzi-kitchen-admin) | Vue3 管理端，用于维护菜品、订单、配送员等 |
| 用户端 | [xiaotuzi-kitchen-app](https://github.com/jiangyi3265/xiaotuzi-kitchen-app) | uni-app 微信小程序，面向用户点单和分享 |

## 快速启动

使用 HBuilderX 打开当前目录：

```text
guanjia-private-kitchen
```

本地预览：

```text
运行 -> 运行到小程序模拟器 -> 微信开发者工具
```

发行体验版：

```text
发行 -> 小程序-微信
```

编译后用微信开发者工具打开：

```text
unpackage/dist/build/mp-weixin
```

注意：不要上传 `unpackage/dist/dev/mp-weixin`，该目录是运行调试包。

## 接口配置

接口配置位于：

```text
config/index.js
utils/request.js
api/
```

当前正式服务地址为：

```text
https://cfht.hcaidachu.cn/api/wx
```

## 简历描述示例

基于 uni-app 开发私房菜微信小程序，完成登录、菜品浏览、菜品详情、购物车、下单、订单列表和分享广场等用户链路，并与 Spring Boot 后端和 Vue3 管理后台联动。
