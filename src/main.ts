import { App, Plugin, PluginSettingTab, Setting, FileSystemAdapter } from 'obsidian';
import { exec } from "child_process";

// Remember to rename these classes and interfaces!

interface ObsidianTortoiseSVNSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: ObsidianTortoiseSVNSettings = {
	mySetting: 'default'
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
				menu.addItem((item) => {
					item
						.setTitle("SVN 更新")
						.setIcon("download-cloud")
						.onClick(async () => {
							exec("TortoiseProc /command:update /closeonend:0  /path:" + adapter.getFullPath(file.path));
						});
				});
				menu.addItem((item) => {
					item
						.setTitle("SVN 提交")
						.setIcon("upload-cloud")
						.onClick(async () => {
							exec("TortoiseProc /command:commit /closeonend:0  /path:" + adapter.getFullPath(file.path));
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
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
