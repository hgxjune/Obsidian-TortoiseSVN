import { App, Plugin, PluginSettingTab, Setting, FileSystemAdapter, TFile, Menu } from 'obsidian';
import { exec } from "child_process";

// Obsidian Plugin Developer Docs
// https://luhaifeng666.github.io/obsidian-plugin-docs-zh/zh2.0/

// debug mode: ctrl+shift+i

// Remember to rename these classes and interfaces!

interface ObsidianTortoiseSVNSettings {
	[key: string]: boolean;

	wt: boolean;
	svn: boolean;
	word: boolean;
	excel: boolean;
	create_word: boolean;
	create_excel: boolean;
}

const DEFAULT_SETTINGS: ObsidianTortoiseSVNSettings = {
	wt: true,
	svn: false,
	word: false,
	excel: false,
	create_word: true,
	create_excel: true,
}

interface FileExtensionName {
	[key: string]: string[];

	word: string[];
	excel: string[];
}
const DEFAULT_EXTNAME: FileExtensionName = {
	word: ["doc", "docx"],
	excel: ["xls", "xlsx"]
}

export default class ObsidianTortoiseSVN extends Plugin {
	settings: ObsidianTortoiseSVNSettings;
	fileExtName: FileExtensionName;

	async onload() {
		await this.loadSettings();

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// Add svn button
		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {
				const adapter = this.app.vault.adapter as FileSystemAdapter;
				const folder = (file as TFile).stat? file.parent?.path : file.path;
				const path = adapter.getFullPath(folder? folder : file.path);
				
				// icon
				// https://lucide.dev/

				this.folderItem(menu, "wt",  "Windows Terminal", "terminal", "wt -d " + path);
				this.folderItem(menu, "svn", "SVN 更新", "download-cloud", "TortoiseProc /command:update /closeonend:0  /path:" + path);
				this.folderItem(menu, "svn", "SVN 提交", "upload-cloud",   "TortoiseProc /command:commit /closeonend:0  /path:" + path);

				this.fileItem(menu, "word",  file.name, "使用 Word 打开",  "file-text", "start winword "+path+"/"+file.name);
				this.fileItem(menu, "excel", file.name, "使用 Excel 打开", "sheet",     "start excel "+path+"/"+file.name);

				// create file
				// this.folderItem(menu, "create_word", "新建 word 文档", "file-text", "echo. 2>"+path+"/新建文档.docx");
				// this.folderItem(menu, "create_excel", "新建 excel 文档", "sheet", "echo. 2>"+path+"/新建文档.xlsx");
			})
		);
	}

	folderItem(menu: Menu, key: string, title: string, icon: string, command: string) {
		if (!this.settings[key]) return;
		menu.addItem((item) => {
			item
				.setTitle(title)
				.setIcon(icon)
				.onClick(async () => { exec(command); });
		})
	}

	fileItem(menu: Menu, key: string, fileName: string, title: string, icon: string, command: string) {
		if (!this.settings[key]) return;
		const extname = fileName.split(".").at(-1);
		if (!extname) return;
		if (!this.fileExtName[key].includes(extname)) return;

		menu.addItem((item) => {
			item
				.setTitle(title)
				.setIcon(icon)
				.onClick(async () => { exec(command); });
		})
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
		this.fileExtName = Object.assign({}, DEFAULT_EXTNAME);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: ObsidianTortoiseSVN;

	constructor(app: App, plugin: ObsidianTortoiseSVN) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;
		containerEl.empty();
		containerEl.createEl('h2', {text: 'Enable context menu.'});

		this.doAddSetting('wt', 'Windows Terminal', 'Use Windows Terminal Here.');
		this.doAddSetting('svn', 'Tortoise SVN', 'Use Tortoise SVN.');
		this.doAddSetting('word', 'Office Word', 'Use Word Open File.');
		this.doAddSetting('excel', 'Office Excel', 'Use Excel Open File.');
		this.doAddSetting('create_word', 'Create Word File', 'Use Word Create File.');
		this.doAddSetting('create_excel', 'Create Excel File', 'Use Excel Create File.');
	}

	doAddSetting(key: string, name: string, desc: string) {
		const {containerEl} = this;
		new Setting(containerEl)
			.setName(name)
			.setDesc(desc)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings[key])
					.onChange((value) => {
						this.plugin.settings[key] = value;
						this.display();
						this.plugin.saveSettings();
					})
		);
	}
}
