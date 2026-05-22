// publish.ts
let exec = null;
import("child_process").then((module) => {
	exec = module.exec;
});
const path = import("path");
let pkg = {
	version: "1.0.0",
};
// 自动读取项目 package.json 中的版本号，省去手动输入的麻烦
import("./package.json").then((module) => (pkg = module.default));

// 1. 获取命令行传入的动态参数 (例如: npm run publish -- -desc="增加全选功能" -robot=2)
const args = process.argv.slice(2);

const getArgValue = (key: string, defaultValue: string | number) => {
	const arg = args.find((a) => a.startsWith(`-${key}=`));
	return arg ? arg.split("=")[1] : defaultValue;
};

// 2. 解析出自定义内容（如果没有传，则使用后面的默认值）
const version = getArgValue("ver", pkg.version); // 默认使用 package.json 的 version
const description = getArgValue("desc", "修复了一些问题，优化了一些功能"); // 默认描述
const robot = getArgValue("robot", "1"); // 默认机器人编号为 1

// 3. 基础固定配置
const cliPath = "D:\\Application\\HBuilderX\\cli.exe";
const projectName = "uni-app";
const appId = "wx8b6acdafc6f87e0c";
const privateKeyPath =
	"D:/Application/HBuilderX/bin/KEY/private.wx8b6acdafc6f87e0c.key";

// 4. 动态拼接 HBuilderX CLI 命令
const cmd = `"${cliPath}" publish --platform mp-weixin --project "${projectName}" --appid ${appId} --upload true --description "${description}" --privatekey "${privateKeyPath}" --version ${version} --robot ${robot}`;

console.log("开始自动化打包上传微信小程序...");
console.log(`当前版本: ${version}`);
console.log(`更新描述: ${description}`);
console.log(`指定机器人: ${robot} 号`);

// 5. 执行命令
const worker = exec(
	cmd,
	(error: Error | null, stdout: Buffer | string, stderr: string | null) => {
		if (error) {
			console.error(`❌ 上传失败: ${error.message}`);
			return;
		}
		if (stderr) {
			console.warn(`⚠️ 编译警告: ${stderr}`);
		}
		console.log(`\n============== LOG ============== \n${stdout}`);
		console.log("上传过程结束");
	},
);

// 实时打印 HBuilderX 的编译进度
worker.stdout.on("data", (data: Buffer | string) => {
	process.stdout.write(data);
});
