/* RH Lead Phone Push v1 - no Telegram.
   VAPID public key configured for services.restuharmoni.com.
   Do not place VAPID private key in frontend files. */
window.RH_PUSH_CONFIG = {
  vapidPublicKey: 'BH2-Ruc4z1daSYb82e1gbSZ29i1NLejYrtl90lUwvuGvyMz2x63pmnAbwS2U0GaH-h3bGiFaUcyEXV9nL87qPto',
  subscriptionTable: 'push_subscriptions',
  edgeFunctionName: 'send-lead-push'
};
