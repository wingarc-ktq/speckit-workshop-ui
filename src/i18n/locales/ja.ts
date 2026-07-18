export const ja = {
  title: 'UIプロトタイプ',
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
      userId: 'メールアドレスまたはユーザー名',
      password: 'パスワード',
      userIdPlaceholder: 'メールアドレスまたはユーザー名を入力',
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
} as const;
