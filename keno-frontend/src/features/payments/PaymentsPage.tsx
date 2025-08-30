import { useEffect, useState } from 'react'
import { getPaymentOptions, initDeposit, initLakipayDeposit, withdrawChapa, withdrawLakipay, type PaymentOptions } from '../../lib/api'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'
import { joinUserRoom, onPaymentStatus, offPaymentStatus, type PaymentStatusEvent } from '../../lib/socket'

export default function PaymentsPage() {
  const { show } = useToast()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [opts, setOpts] = useState<PaymentOptions | null>(null)
  const [tab, setTab] = useState<'deposit' | 'withdraw'>('deposit')
  const [provider, setProvider] = useState<'chapa' | 'lakipay'>('chapa')

  // deposit
  const [amount, setAmount] = useState(50)
  const [phone, setPhone] = useState('')

  // withdraw (chapa)
  const [accountName, setAccountName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [bankCode, setBankCode] = useState('')
  const [medium, setMedium] = useState('MPESA')

  useEffect(() => {
    (async () => {
      try {
        const o = await getPaymentOptions()
        setOpts(o)
        if (!bankCode && o?.chapa?.banks?.length) setBankCode(o.chapa.banks[0].code)
      } catch (e: any) {
        show(e?.message || 'Failed to load payment options', 'error')
      }
    })()
    if (user?.id) joinUserRoom(String(user.id))
    const handler = (e: PaymentStatusEvent) => {
      if (e.status === 'pending') show('Payment pending…', 'info')
      if (e.status === 'redirect') show('Redirecting to payment…', 'info')
      if (e.status === 'completed') show('Payment completed', 'success')
      if (e.status === 'failed' || e.status === 'error') show(e ? `${e.provider} ${e.type} failed` : 'Payment failed', 'error')
    }
    onPaymentStatus(handler)
    return () => {
      offPaymentStatus(handler)
    }
  }, [])

  const onDeposit = async () => {
    try {
      setLoading(true)
      if (provider === 'chapa') {
        const { checkout_url } = await initDeposit(amount, 'ETB')
        if (checkout_url) window.location.href = checkout_url
      } else {
        const res = await initLakipayDeposit(amount, phone)
        const url = (res?.lakipay?.payment_url) || (res?.lakipay?.data?.payment_url)
        if (url) window.location.href = url
      }
    } catch (e: any) {
      show(e?.message || 'Deposit failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const onWithdraw = async () => {
    try {
      setLoading(true)
      if (provider === 'chapa') {
        await withdrawChapa({ amount, account_number: accountNumber, account_name: accountName, bank_code: bankCode })
        show('Withdrawal initiated', 'success')
      } else {
        await withdrawLakipay({ amount, phone, medium })
        show('Withdrawal initiated', 'success')
      }
    } catch (e: any) {
      show(e?.message || 'Withdrawal failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-900/50 p-4 shadow-xl backdrop-blur-xl">
      <div className="mb-3 flex items-center gap-2">
        <button onClick={() => setTab('deposit')} className={`rounded-lg px-3 py-1 text-sm ${tab==='deposit'?'bg-emerald-700 text-emerald-50':'bg-slate-800 text-slate-200'}`}>Deposit</button>
        <button onClick={() => setTab('withdraw')} className={`rounded-lg px-3 py-1 text-sm ${tab==='withdraw'?'bg-emerald-700 text-emerald-50':'bg-slate-800 text-slate-200'}`}>Withdraw</button>
        <div className="ml-auto flex items-center gap-2 text-xs text-slate-300/90">
          <span>Provider:</span>
          <select value={provider} onChange={(e) => setProvider(e.target.value as any)} className="rounded border border-white/10 bg-slate-800/60 px-2 py-1">
            <option value="chapa">Chapa</option>
            <option value="lakipay">Lakipay</option>
          </select>
        </div>
      </div>

      {tab === 'deposit' ? (
        <div className="grid gap-3">
          <div className="grid gap-1">
            <label className="text-xs text-slate-300/90">Amount</label>
            <select value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="rounded-xl border border-white/10 bg-slate-800/60 px-3 py-2 text-sm text-slate-100">
              {[10,20,50,100,200].map(v => (<option key={v} value={v}>{v}</option>))}
            </select>
          </div>
          {provider === 'lakipay' && (
            <div className="grid gap-1">
              <label className="text-xs text-slate-300/90">Phone (without country code)</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9XXXXXXXX" className="rounded-xl border border-white/10 bg-slate-800/60 px-3 py-2 text-sm text-slate-100" />
            </div>
          )}
          <button disabled={loading} onClick={onDeposit} className="rounded-xl border border-emerald-300/20 bg-gradient-to-br from-emerald-600 to-emerald-700 px-3 py-2 text-sm font-semibold text-emerald-50 disabled:opacity-60">{loading?'Please wait…':'Continue'}</button>
        </div>
      ) : (
        <div className="grid gap-3">
          <div className="grid gap-1">
            <label className="text-xs text-slate-300/90">Amount</label>
            <select value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="rounded-xl border border-white/10 bg-slate-800/60 px-3 py-2 text-sm text-slate-100">
              {[10,20,50,100,200].map(v => (<option key={v} value={v}>{v}</option>))}
            </select>
          </div>
          {provider === 'chapa' ? (
            <>
              <div className="grid gap-1">
                <label className="text-xs text-slate-300/90">Account name</label>
                <input value={accountName} onChange={(e) => setAccountName(e.target.value)} className="rounded-xl border border-white/10 bg-slate-800/60 px-3 py-2 text-sm text-slate-100" />
              </div>
              <div className="grid gap-1">
                <label className="text-xs text-slate-300/90">Account number</label>
                <input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="rounded-xl border border-white/10 bg-slate-800/60 px-3 py-2 text-sm text-slate-100" />
              </div>
              <div className="grid gap-1">
                <label className="text-xs text-slate-300/90">Bank</label>
                <select value={bankCode} onChange={(e) => setBankCode(e.target.value)} className="rounded-xl border border-white/10 bg-slate-800/60 px-3 py-2 text-sm text-slate-100">
                  {(opts?.chapa?.banks||[]).map(b => (<option key={b.code} value={b.code}>{b.name}</option>))}
                </select>
              </div>
            </>
          ) : (
            <>
              <div className="grid gap-1">
                <label className="text-xs text-slate-300/90">Phone (without country code)</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9XXXXXXXX" className="rounded-xl border border-white/10 bg-slate-800/60 px-3 py-2 text-sm text-slate-100" />
              </div>
              <div className="grid gap-1">
                <label className="text-xs text-slate-300/90">Medium</label>
                <select value={medium} onChange={(e) => setMedium(e.target.value)} className="rounded-xl border border-white/10 bg-slate-800/60 px-3 py-2 text-sm text-slate-100">
                  {(opts?.lakipay?.mediums||['MPESA','TELEBIRR','CBE']).map(m => (<option key={m} value={m}>{m}</option>))}
                </select>
              </div>
            </>
          )}
          <button disabled={loading} onClick={onWithdraw} className="rounded-xl border border-emerald-300/20 bg-gradient-to-br from-emerald-600 to-emerald-700 px-3 py-2 text-sm font-semibold text-emerald-50 disabled:opacity-60">{loading?'Please wait…':'Withdraw'}</button>
        </div>
      )}
    </section>
  )
}


