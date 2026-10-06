export async function sendLineNotify(token: string, message: string) {
  try {
    const response = await fetch('https://notify-api.line.me/api/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${token}`
      },
      body: new URLSearchParams({ message })
    });
    return response.ok;
  } catch (error) {
    console.error('LINE Notify Error:', error);
    return false;
  }
}