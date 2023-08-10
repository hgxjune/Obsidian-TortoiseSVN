import { App, Plugin, PluginSettingTab, Setting, FileSystemAdapter, TFile } from 'obsidian';
import { exec } from "child_process";

// Obsidian Plugin Developer Docs
// https://luhaifeng666.github.io/obsidian-plugin-docs-zh/zh2.0/

// Remember to rename these classes and interfaces!

interface ObsidianTortoiseSVNSettings {
	wt: boolean;
}

const DEFAULT_SETTINGS: ObsidianTortoiseSVNSettings = {
	wt: false
}

export default class ObsidianTortoiseSVN extends Plugin {
	settings: ObsidianTortoiseSVNSettings;

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

				menu.addItem((item) => {
					item
						.setTitle("SVN 更新")
						.setIcon("download-cloud")
						.onClick(async () => {
							exec("TortoiseProc /command:update /closeonend:0  /path:" + path);
						});
				});
				menu.addItem((item) => {
					item
						.setTitle("SVN 提交")
						.setIcon("upload-cloud")
						.onClick(async () => {
							exec("TortoiseProc /command:commit /closeonend:0  /path:" + path);
						});
				});
				if (this.settings.wt)
					menu.addItem((item) => {
						item
							.setTitle("Windows Terminal")
							.setIcon("terminal")
							.onClick(async () => {
								exec("wt -d " + path);
							});
					});
			})
		);

	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
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
		containerEl.createEl('h2', {text: 'Settings for my awesome plugin.'});

		new Setting(containerEl)
			.setName('Windows Terminal')
			.setDesc('Use Windows Terminal here')
			.addToggle((toggle) =>
			toggle
				.setValue(this.plugin.settings.wt)
				.onChange((value) => {
					this.plugin.settings.wt = value;
					this.display();
					this.plugin.saveSettings();
				})
		);
	}
}
