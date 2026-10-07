import sys

with open('src/app/pos/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip = False
for i, line in enumerate(lines):
    if 'const [customerName, setCustomerName] = useState(' in line:
        new_lines.append("""
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
""")
    elif 'const executeCheckout = async () => {' in line:
        skip = True
        new_lines.append("""
  const executeCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch('/api/pos/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          items: cart, 
          paymentMethod, 
          cashTendered: paymentMethod === 'CASH' ? cashTendered : total, 
          customerId: selectedCustomerId || undefined,
          promotionId: appliedPromo?.id || undefined,
          discountAmount,
          pointsUsed: usePoints
        })
      });
      if (res.ok) {
        const resData = await res.json();
        setReceiptData({
          orderId: resData.soNumber,
          date: new Date().toLocaleString('th-TH'),
          customerName: customers.find(c=>c.id===selectedCustomerId)?.name || undefined,
          items: [...cart],
          total,
          paymentMethod,
        });
        
        // Reset
        setCart([]);
        setCashTendered(0);
        setSelectedCustomerId('');
        setAppliedPromo(null);
        setPromoCodeInput('');
        setUsePoints(0);

        // Refresh products stock
        fetch('/api/inventory').then(r => r.json()).then(setProducts).catch(console.error);
      } else {
        alert('เกิดข้อผิดพลาดในการบันทึกการขาย');
      }
    } catch (err) {
      alert('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้');
    } finally {
      setLoading(false);
      setIsPromptPayOpen(false);
    }
  };
""")
    elif skip and 'return (' in line:
        skip = False
        new_lines.append(line)
    elif skip:
        pass
    elif 'placeholder="ชื่อลูกค้า (ไม่บังคับ)"' in line:
        # Find the start of the input element and skip it
        pass # We will handle this by skipping the previous '<input'
    else:
        new_lines.append(line)

# Wait, the input replacement needs to be careful
content = "".join(new_lines)
import re

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
content = re.sub(r'<input[^>]*?placeholder="ชื่อลูกค้า \(ไม่บังคับ\)"[^>]*?/>', ui_replacement.strip(), content)

content = content.replace("customerName={customerName}", "customerName={customers.find(c=>c.id===selectedCustomerId)?.name || ''}")

with open('src/app/pos/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
