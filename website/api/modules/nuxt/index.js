const path = require('path')
const readFileSync = require('fs').readFileSync
const Mustache = require('mustache')

const { mergeCustomTypesWithSlices } = require('../shared')

const { readCustomTypes } = require('../../utils')

const {
	createPrismicConfigurationFile,
	createPrismicVuePluginFile,
	linkResolverPluginFile,
	createUidPage
} = require('./helpers')

const protocol = require('./protocol.json')

export default () => {
	// Returns stored custom_types for a given framework
	const customTypes = readCustomTypes(path.join(__dirname, 'custom_types'))
	return {
		customTypes,
		customTypesFolder: path.join(__dirname, 'custom_types'),
		srcUrl: 'src',
		mergeSlices: (
			slices, // definitions of slices user asked for download
			ct = customTypes,
			// custom_type ids that should be merged (eg. ['page', 'homepage', ...])
			customTypesToMerge = protocol.customTypesToMerge
		) => mergeCustomTypesWithSlices(ct, slices, customTypesToMerge),
		createFiles: (_, handle) => {
			const files = [
				{
					name: 'prismic.config.js',
					f: createPrismicConfigurationFile()
				},
				// {
				// 	name: 'plugins/link-resolver.js',
				// 	f: linkResolverPluginFile()
				// },
				// {
				// 	name: 'plugins/prismic-vue.js',
				// 	f: createPrismicVuePluginFile()
				// },
				{
					name: 'pages/index.vue',
					f: Mustache.render(
						readFileSync(
							path.join(__dirname, 'templates/index.mustache'),
							'utf8'
						)
					)
				},
				{
					name: 'pages/_uid.vue',
					f: createUidPage({
						configPath: '@/prismic.config.js',
						customType: 'page',
						// This should be passed by argument to every module
						sliceMachinePath: '@/sliceMachine'
					})
				}
			]
			files.forEach(handle)
		},
		protocol
	}
}
