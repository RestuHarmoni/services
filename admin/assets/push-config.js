/* RH Lead Phone Push v1 - no Telegram.
   Replace this value after generating VAPID keys. See docs/RH_PUSH_NO_TELEGRAM_SETUP.md */
window.RH_PUSH_CONFIG = {
  vapidPublicKey: 'PASTE_VAPID_PUBLIC_KEY_HERE',
  subscriptionTable: 'push_subscriptions',
  edgeFunctionName: 'send-lead-push'
};
