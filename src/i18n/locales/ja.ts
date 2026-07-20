export const ja = {
  title: 'UIプロトタイプ',
  common: {
    cancel: 'キャンセル',
    close: '閉じる',
    save: '保存',
    delete: '削除',
    edit: '編集',
    create: '作成',
  },
  auth: {
    login: 'ログイン',
    logout: 'ログアウト',
  },
  navigation: {
    home: 'ホーム',
    dashboard: 'ダッシュボード',
  },
  actions: {
    ok: 'OK',
    reloadPage: 'ページを更新する',
  },
  validations: {
    require: '必須項目です',
    invalidEmail: '有効なメールアドレスを入力してください',
    minLength: '{{min}}文字以上で入力してください',
    maxLength: '{{max}}文字以内で入力してください',
    eitherEmailOrUsername:
      'メールアドレスまたはユーザー名のいずれかを入力してください',
  },
  errors: {
    title: {
      error: 'エラー',
    },
    general: {
      networkError:
        'ネットワークエラーが発生しました。ネットワーク接続をご確認ください。',
      unknownError: '不明なエラーが発生しました。',
    },
    auth: {
      invalidCredentials:
        'メールアドレス（またはユーザー名）またはパスワードが正しくありません。',
      noSession: 'セッションが存在しません。再度ログインしてください。',
      sessionExpired:
        'セッションの有効期限が切れました。再度ログインしてください。',
      networkError:
        '認証サーバーとの通信に失敗しました。しばらく時間をおいてから再度お試しください。',
    },
    http: {
      internalServerError:
        '現在システムが混雑しています。しばらく時間をおいてから再度お試しください。',
      badRequest: '不正なパラメータが送信されました。',
      notLoggedIn: 'ログインしていません。',
      forbidden:
        'この操作を行う権限がありません。問題が解消しない場合はブラウザをリロードしてください。',
      notFound: '対象が見つかりません。',
      payloadTooLarge: 'データ量の上限を超過しました。',
      serviceUnavailable:
        'サーバーが一時的に混雑しているか、メンテナンス中です。時間を空けて再度試してください。',
      gatewayTimeout: 'サーバーが時間内に応答しませんでした。',
    },
  },
  components: {
    loadError: {
      message: '読み込みに失敗しました',
      reload: '再読み込み',
    },
    tagSelector: {
      label: 'タグ',
      placeholder: 'タグを選択...',
      noOptions: '利用可能なタグがありません',
      loading: '読み込み中...',
      clear: 'クリア',
      close: '閉じる',
      open: '開く',
    },
  },
  homePage: {
    title: 'ダッシュボード',
    welcome: 'Dashboardへようこそ。こちらがメインのダッシュボードページです。',
    overview: {
      title: 'システム概要',
      description:
        'モダンなウェブアプリケーションの構成を作ってみているところです。',
    },
  },
  loginPage: {
    title: 'ログイン',
    subtitle: 'アカウントにログインしてください',
    form: {
      email: 'メールアドレス',
      password: 'パスワード',
      emailPlaceholder: 'メールアドレスを入力',
      passwordPlaceholder: 'パスワードを入力',
      loginButton: 'ログイン',
      rememberMe: 'ログイン状態を記録する',
    },
    forgotPassword: 'パスワードを忘れた場合',
  },
  notFoundPage: {
    title: 'ページが見つかりません',
    description:
      'お探しのページは削除されたか、一時的にアクセスできない状態です。URLをご確認いただくか、下記のボタンから他のページへ移動してください。',
    actions: {
      goHome: 'ホームに戻る',
      goBack: '前のページに戻る',
    },
  },
  crashPage: {
    title:
      'ページを表示できませんでした。ページを更新してもう一度お試しください。',
  },
  filesPage: {
    fileUploadZone: {
      dragActive: 'ここにファイルをドロップ...',
      dragInactive: 'クリックしてアップロード、またはドラッグ&ドロップ',
      supportedFormats: 'PDF、Word、Excel、画像 - 最大200MB',
    },
    uploadSection: {
      title: 'ファイルをアップロード',
      maxFilesError: '一度にアップロードできるファイルは最大20個までです。',
      unsupportedFilesError:
        '次のファイルはサポートされていないか、サイズが大きすぎます: {{files}}',
      uploadComplete: 'アップロード完了',
      uploadFailed: 'アップロードに失敗しました',
      progressPercent: '{{progress}}%',
    },
    myFilesSection: {
      title: 'マイファイル',
      noResults: '検索結果が見つかりませんでした',
      noResultsDescription:
        '別のキーワードで検索するか、検索条件をクリアしてください',
      bulkDownload: '選択したファイルをダウンロード ({{count}})',
    },
    fileDetailDialog: {
      title: 'ファイル詳細',
      close: '閉じる',
      download: 'ダウンロード',
      edit: '編集',
      fileName: 'ファイル名',
      fileSize: 'ファイルサイズ',
      uploadedAt: 'アップロード日時',
      tags: 'タグ',
      noTags: 'タグなし',
      description: '説明',
      preview: {
        pdf: {
          title: 'PDFプレビュー機能は今後実装予定です',
          description:
            'ダウンロードボタンからファイルをダウンロードしてください',
        },
        unsupported: {
          title: 'プレビュー機能は対応していません',
          description:
            'ダウンロードボタンからファイルをダウンロードしてください',
        },
      },
    },
    fileEditDialog: {
      title: 'ファイルを編集',
      fileName: 'ファイル名',
      fileNameError: 'ファイル名は1〜255文字で入力してください',
      description: '説明',
      descriptionError: '説明は500文字以内で入力してください',
      tags: 'タグ',
    },
    recentFilesSection: {
      title: '最近使用したファイル',
      fileCard: {
        viewButton: '文書を見る',
      },
      emptyState: {
        title: '最近使用したファイルはありません',
        description:
          'ファイルをアップロードすると、ここに最近使用したファイルが表示されます',
      },
    },
  },
  layouts: {
    appHeader: {
      searchPlaceholder: 'ファイルを検索...',
      filterPopover: {
        title: '詳細検索',
        searchLabel: 'キーワード',
        searchPlaceholder: 'ファイル名を入力...',
        tagsLabel: 'タグで絞り込み',
        tagsPlaceholder: 'タグを選択...',
        clear: 'クリア',
        apply: '適用',
      },
    },
    appSidebar: {
      general: {
        title: '一般',
        myFiles: 'マイファイル',
        recent: '最近使用したファイル',
        sharedWithMe: '共有アイテム',
        deletedFiles: 'ゴミ箱',
      },
      tags: {
        title: 'タグ',
        manageDialog: {
          title: 'タグの管理',
          createButton: '新しいタグを作成',
        },
        formDialog: {
          createTitle: 'タグを作成',
          editTitle: 'タグを編集',
          nameLabel: 'タグ名',
          nameRequired: 'タグ名は必須です',
          nameMaxLength: 'タグ名は50文字以内で入力してください',
          colorLabel: '色',
          colorRequired: '色は必須です',
          createButton: '作成',
          saveButton: '保存',
        },
        deleteDialog: {
          title: 'タグを削除',
          message: '「{{tagName}}」を削除してもよろしいですか?',
          warning:
            'このタグが使用されているファイルから、このタグが削除されます。この操作は取り消せません。',
          confirmButton: '削除',
        },
      },
      storage: {
        title: 'ストレージ',
        upgrade: 'アップグレード',
        usage: '{{used}} GB / {{total}} GB',
      },
    },
  },
} as const;
