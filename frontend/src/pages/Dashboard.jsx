import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Modal from 'react-modal';
import '../App.css'; 

// Erişilebilirlik için Modal'ın ana uygulama elementini belirtiyoruz
Modal.setAppElement('#root');

const API_URL = 'http://localhost:5000';

function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const STATUS_OPTIONS = ["Alındı", "Hazırlanıyor", "Yolda", "Teslim Edildi", "İptal"];

  // Modal (Popup Pencere) için state'ler
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [formData, setFormData] = useState({});

  // Backend'den tüm siparişleri çeken fonksiyon
  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/orders`);
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Siparişleri çekerken hata oluştu:", error);
      toast.error("Siparişler sunucudan yüklenemedi.");
    }
  };

  // Sayfa ilk yüklendiğinde siparişleri çek
  useEffect(() => {
    fetchOrders();
  }, []);

  // Yeni bir test siparişi ekleyen fonksiyon
  const handleAddTestOrder = async () => {
    const testOrder = {
      customer: `Müşteri-${Math.floor(Math.random() * 1000)}`,
      item: 'Rastgele Ürün'
    };
    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testOrder),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Sunucu hatası oluştu.');
      }
      toast.success("Yeni test siparişi eklendi!");
      fetchOrders();
    } catch (error) {
      console.error("Sipariş ekleme hatası:", error);
      toast.error(error.message);
    }
  };
  
  // Siparişin durumunu güncelleyen fonksiyon
  const handleStatusChange = async (orderId, newStatus) => {
    await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
    });
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    toast.info(`Sipariş #${orderId} durumu güncellendi.`);
  };

  // DM gönderme simülasyonu
  const handleSendDm = async (orderId) => {
      const message = "Siparişiniz yola çıkmıştır. Bizi tercih ettiğiniz için teşekkürler!";
      const response = await fetch(`${API_URL}/orders/${orderId}/send-dm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message })
      });
      const result = await response.json();
      toast.success(result.message);
  };

  // --- Modal (Popup) Fonksiyonları ---
  const openModal = (order) => {
    setSelectedOrder(order);
    setFormData(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    await fetch(`${API_URL}/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    });
    toast.success(`Sipariş #${selectedOrder.id} detayları kaydedildi.`);
    closeModal();
    fetchOrders();
  };
  // ---

  // Arama kutusuna göre siparişleri filtrele
  const filteredOrders = orders.filter(order => 
    order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="App">
      <header className="app-header">
        <h1>Instagram Sipariş Paneli</h1>
        <button onClick={handleAddTestOrder} className="add-button">
          Test Siparişi Ekle
        </button>
      </header>
      
      <div className="search-container">
        <input 
          type="text"
          placeholder="Müşteri veya ürün ara..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <main>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Müşteri</th>
              <th>Ürün</th>
              <th>Durum</th>
              <th>Durumu Değiştir</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.customer}</td>
                <td>{order.item}</td>
                <td>
                  <span className={`status status-${order.status.toLowerCase().replace(' ', '-')}`}>
                    {order.status}
                  </span>
                </td>
                <td>
                  <select 
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="status-select"
                  >
                    {STATUS_OPTIONS.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </td>
                <td>
                    <button onClick={() => openModal(order)} className='details-button'>Detaylar</button>
                    <button onClick={() => handleSendDm(order.id)} className='dm-button'>DM Gönder</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>

      {/* Sipariş Detayları için Modal (Popup) Penceresi */}
      {selectedOrder && (
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          contentLabel="Sipariş Detayları"
          className="modal"
          overlayClassName="overlay"
        >
          <h2>Sipariş #{selectedOrder.id} Detayları</h2>
          <form onSubmit={handleFormSubmit}>
            <label>Müşteri Adı:</label>
            <input type="text" name="customer" value={formData.customer || ''} onChange={handleFormChange} />
            
            {/* YENİ EKLENEN ALAN */}
            <label>Ürün Bilgisi:</label>
            <input type="text" name="item" value={formData.item || ''} onChange={handleFormChange} />
            
            <label>Telefon:</label>
            <input type="text" name="phone" value={formData.phone || ''} onChange={handleFormChange} placeholder="Telefon numarası ekle..."/>
            
            <label>Adres:</label>
            <textarea name="address" value={formData.address || ''} onChange={handleFormChange} placeholder="Adres bilgisi ekle..."></textarea>
            
            <label>Sipariş Notları:</label>
            <textarea name="notes" value={formData.notes || ''} onChange={handleFormChange} placeholder="Siparişle ilgili notlar..."></textarea>
            
            <div className="modal-buttons">
              <button type="submit" className="save-button">Kaydet</button>
              <button type="button" onClick={closeModal}>İptal</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default Dashboard;