const wait = (ms) => new Promise((r) => setTimeout(r, ms))

export async function verifyPan(pan) {
  await wait(1400)
  return { name: 'Nidhi Muralikrishnan', pan }
}

export async function verifyOtp(phone, otp) {
  await wait(1500)
  if (otp !== '123456') throw new Error('OTP_FAILED')
  return {
    phone,
    address: '12 Residency Road, Bengaluru, Karnataka 560025',
  }
}

export async function verifyPennyDrop() {
  await wait(1200)
  const success = Math.random() > 0.35
  if (!success) throw new Error('PENNY_DROP_FAILED')
  return { accountHolderName: 'Nidhi Muralikrishnan' }
}
