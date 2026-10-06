import re

with open('src/app/pos/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add states
states_injection = """
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  
  const [promotions, setPromotions] = useState<any[]>([]);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<any | null>(null);
  
  const [usePoints, setUsePoints] = useState<number>(0);
  
  useEffect(() => {
    fetch('/api/customers').then(r => r.json()).then(setCustomers).catch(()=>console.log('Customer fetch err'));
    fetch('/api/promotions').then(r => r.json()).then(setPromotions).catch(()=>console.log('Promo fetch err'));
  }, []);
"""
content = re.sub(r'(const \[loading, setLoading\] = useState\(false\);)', r'\1\n' + states_injection, content)

# Calculate total
calc_logic = """
  const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) * item.qty), 0);
  
  let discountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.discountType === 'PERCENT') {
      discountAmount = subtotal * (appliedPromo.discountValue / 100);
    } else {
      discountAmount = appliedPromo.discountValue;
    }
  }
  
  // Assuming 1 point = 1 Baht discount for now (can be dynamic via settings)
  const pointsDiscount = usePoints;
  
  const total = Math.max(0, subtotal - discountAmount - pointsDiscount);
"""
content = re.sub(r'const total = cart\.reduce\(\(sum, item\) => sum \+ \(Number\(item\.price\) \* item\.qty\), 0\);', calc_logic, content)

# Update payload
payload_update = """
        const res = await fetch('/api/pos/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            items: cart, 
            paymentMethod, 
            cashTendered: paymentMethod === 'CASH' ? cashTendered : total, 
            customerId: selectedCustomerId,
            promotionId: appliedPromo?.id,
            discountAmount,
            pointsUsed: usePoints
          })
        });
"""
content = re.sub(r'const res = await fetch\(\'/api/pos/checkout\', \{[^}]*body: JSON\.stringify\(\{[^}]*\}\)[\s\S]*?\}\);', payload_update.strip(), content)

# Update reset logic
content = re.sub(r'setCustomerName\(\'\'\);', r'setSelectedCustomerId(\'\');\n          setAppliedPromo(null);\n          setPromoCodeInput(\'\');\n          setUsePoints(0);', content)

# Replace UI customerName with Select
ui_replacement = """
          <select 
            className="input" 
            style={{ marginBottom: '0.5rem', fontSize: '0.8rem' }}
            value={selectedCustomerId}
            onChange={(e) => {
              setSelectedCustomerId(e.target.value);
              setUsePoints(0);
            }}
          >
            <option value="">-- เลือกลูกค้า (ไม่บังคับ) --</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name} (แต้ม: {c.points})</option>)}
          </select>

          {selectedCustomerId && customers.find(c=>c.id===selectedCustomerId)?.points > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
              <span>ใช้แต้มลดราคา (มี {customers.find(c=>c.id===selectedCustomerId)?.points} แต้ม):</span>
              <input 
                type="number" 
                max={customers.find(c=>c.id===selectedCustomerId)?.points} 
                min={0}
                value={usePoints || ''}
                onChange={e => setUsePoints(Math.min(Number(e.target.value), customers.find(c=>c.id===selectedCustomerId)?.points || 0))}
                style={{ width: '80px', padding: '0.2rem', borderRadius: '4px', border: '1px solid var(--border)' }}
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', marginBottom: '0.75rem' }}>
            <input 
              type="text" 
              placeholder="โค้ดส่วนลด..." 
              value={promoCodeInput}
              onChange={e => setPromoCodeInput(e.target.value.toUpperCase())}
              style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.8rem' }}
            />
            <button 
              onClick={() => {
                const promo = promotions.find(p => p.code === promoCodeInput && p.isActive);
                if(promo) setAppliedPromo(promo);
                else alert('ไม่พบโค้ดนี้ หรือโค้ดหมดอายุแล้ว');
              }}
              style={{ padding: '0.5rem 1rem', background: 'var(--primary)', color: 'white', borderRadius: '6px', fontSize: '0.8rem', border: 'none', cursor: 'pointer' }}
            >
              ใช้โค้ด
            </button>
          </div>
"""
content = re.sub(r'<input[\s\S]*?placeholder="ชื่อลูกค้า \(ไม่บังคับ\)"[\s\S]*?/>', ui_replacement.strip(), content)

# Update subtotal UI
subtotal_ui = """
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <span>ยอดรวม:</span>
              <span>฿{subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            {(discountAmount > 0 || pointsDiscount > 0) && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--danger)' }}>
                <span>ส่วนลด:</span>
                <span>-฿{(discountAmount + pointsDiscount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
              <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>ยอดสุทธิ:</span>
              <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#059669', fontFamily: 'monospace' }}>
                ฿{total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
"""
content = re.sub(r'<div style=\{\{ display: \'flex\', justifyContent: \'space-between\', alignItems: \'baseline\', marginBottom: \'0\.75rem\' \}\}>[\s\S]*?</div>', subtotal_ui.strip(), content)

with open('src/app/pos/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)