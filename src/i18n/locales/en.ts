export const en = {
  title: 'ui-prototype',
  common: {
    cancel: 'Cancel',
    close: 'Close',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
  },
  auth: {
    login: 'Login',
    logout: 'Logout',
  },
  navigation: {
    home: 'Home',
    dashboard: 'Dashboard',
  },
  actions: {
    ok: 'OK',
    reloadPage: 'Reload Page',
  },
  validations: {
    require: 'This field is required',
    invalidEmail: 'Please enter a valid email address',
    minLength: 'Please enter at least {{min}} characters',
    maxLength: 'Please enter no more than {{max}} characters',
    eitherEmailOrUsername: 'Please enter either email or username',
  },
  errors: {
    title: {
      error: 'Error',
    },
    general: {
      networkError:
        'A network error has occurred. Please check your network connection.',
      unknownError: 'An unknown error has occurred.',
    },
    auth: {
      invalidCredentials: 'Invalid email address (or username) or password.',
      noSession: 'Session does not exist. Please login again.',
      sessionExpired: 'Session has expired. Please login again.',
      networkError:
        'Failed to communicate with authentication server. Please try again later.',
    },
    http: {
      internalServerError:
        'The system is currently busy. Please try again later.',
      badRequest: 'Invalid parameters were sent.',
      notLoggedIn: 'You are not logged in.',
      forbidden:
        'You do not have permission to perform this operation. If the problem persists, please reload your browser.',
      notFound: 'The target was not found.',
      payloadTooLarge: 'Data size limit exceeded.',
      serviceUnavailable:
        'The server is temporarily busy or under maintenance. Please try again later.',
      gatewayTimeout: 'The server did not respond in time.',
    },
  },
  components: {
    loadError: {
      message: 'Failed to load.',
      reload: 'Reload',
    },
    tagSelector: {
      label: 'Tags',
      placeholder: 'Select tags...',
      noOptions: 'No tags available',
      loading: 'Loading...',
      clear: 'Clear',
      close: 'Close',
      open: 'Open',
    },
  },
  homePage: {
    title: 'Dashboard',
    welcome: 'Welcome to Admin Dashboard. This is the main dashboard page.',
    overview: {
      title: 'System Overview',
      description: `I'm playing around with a modern web app setup.`,
    },
  },
  loginPage: {
    title: 'Login',
    subtitle: 'Please sign in to your account',
    form: {
      email: 'Email Address',
      password: 'Password',
      emailPlaceholder: 'Enter your email address',
      passwordPlaceholder: 'Enter your password',
      loginButton: 'Login',
      rememberMe: 'Remember me',
    },
    forgotPassword: 'Forgot Password?',
  },
  notFoundPage: {
    title: 'Page Not Found',
    description:
      'The page you are looking for has been deleted or is temporarily unavailable. Please check the URL or navigate to other pages using the buttons below.',
    actions: {
      goHome: 'Go Home',
      goBack: 'Go Back',
    },
  },
  crashPage: {
    title:
      'The page could not be displayed. Please refresh the page and try again.',
  },
  filesPage: {
    fileUploadZone: {
      dragActive: 'Drop files here...',
      dragInactive: 'Click to upload or drag and drop',
      supportedFormats: 'PDF, Word, Excel, Images - Max 200MB',
    },
    uploadSection: {
      title: 'Upload Files',
      maxFilesError: 'You can upload a maximum of 20 files at once.',
      unsupportedFilesError:
        'The following files are not supported or too large: {{files}}',
      uploadComplete: 'Upload complete',
      uploadFailed: 'Upload failed',
      progressPercent: '{{progress}}%',
    },
    myFilesSection: {
      title: 'My Files',
      noResults: 'No search results found',
      noResultsDescription:
        'Try a different keyword or clear the search filter',
      bulkDownload: 'Download selected files ({{count}})',
    },
    fileDetailDialog: {
      title: 'File Details',
      close: 'Close',
      download: 'Download',
      edit: 'Edit',
      fileName: 'File Name',
      fileSize: 'File Size',
      uploadedAt: 'Uploaded At',
      tags: 'Tags',
      noTags: 'No tags',
      description: 'Description',
      preview: {
        pdf: {
          title: 'PDF preview feature will be available soon',
          description: 'Please download the file using the download button',
        },
        unsupported: {
          title: 'Preview not available',
          description: 'Please download the file using the download button',
        },
      },
    },
    fileEditDialog: {
      title: 'Edit File',
      fileName: 'File Name',
      fileNameError: 'File name must be between 1 and 255 characters',
      description: 'Description',
      descriptionError: 'Description must be no more than 500 characters',
      tags: 'Tags',
    },
    recentFilesSection: {
      title: 'Recent Files',
      fileCard: {
        viewButton: 'View Document',
      },
    },
  },
  layouts: {
    appHeader: {
      searchPlaceholder: 'Search files...',
      filterPopover: {
        title: 'Advanced Search',
        searchLabel: 'Keyword',
        searchPlaceholder: 'Enter file name...',
        tagsLabel: 'Filter by tags',
        tagsPlaceholder: 'Select tags...',
        clear: 'Clear',
        apply: 'Apply',
      },
    },
    appSidebar: {
      general: {
        title: 'General',
        myFiles: 'My Files',
        recent: 'Recent',
        sharedWithMe: 'Shared with Me',
        deletedFiles: 'Deleted Files',
      },
      tags: {
        title: 'Tags',
        manageDialog: {
          title: 'Manage Tags',
          createButton: 'Create New Tag',
        },
        formDialog: {
          createTitle: 'Create Tag',
          editTitle: 'Edit Tag',
          nameLabel: 'Tag Name',
          nameRequired: 'Tag name is required',
          nameMaxLength: 'Tag name must be 50 characters or less',
          colorLabel: 'Color',
          colorRequired: 'Color is required',
          createButton: 'Create',
          saveButton: 'Save',
        },
        deleteDialog: {
          title: 'Delete Tag',
          message: 'Are you sure you want to delete "{{tagName}}"?',
          warning:
            'This tag will be removed from all files using it. This action cannot be undone.',
          confirmButton: 'Delete',
        },
      },
      storage: {
        title: 'Storage',
        upgrade: 'Upgrade',
        usage: '{{used}} GB of {{total}} GB',
      },
    },
  },
} as const;
