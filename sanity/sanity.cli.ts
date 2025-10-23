import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 's6cp4kz0',
    dataset: 'production'
  },
  deployment: {
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/cli#auto-updates
     */
    autoUpdates: true,
  }
})
