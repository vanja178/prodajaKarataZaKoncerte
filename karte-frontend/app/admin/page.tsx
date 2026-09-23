"use client";

import { useEffect, useState } from "react";

interface Location {
  id: number;
  name: string;
  address: string;
}

interface Category {
  id: number;
  name: string;
}

interface Currency {
  id: number;
  code: string;
  name: string;
}

interface Concert {
  id: number;
  name: string;
  dateTime: string;
  location: { id: number; name: string };
  category: { id: number; name: string };
}

interface SeatingRegion {
  id: number;
  name: string;
  capacity: number;
  location: { id: number; name: string };
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState("locations");
  const [locations, setLocations] = useState<Location[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [seatingRegions, setSeatingRegions] = useState<SeatingRegion[]>([]);

  const [newLocation, setNewLocation] = useState({ name: "", address: "" });
  const [newCategory, setNewCategory] = useState({ name: "" });
  const [newCurrency, setNewCurrency] = useState({ code: "", name: "" });
  const [newConcert, setNewConcert] = useState({ name: "", dateTime: "", locationId: "", categoryId: "" });
  const [newRegion, setNewRegion] = useState({ name: "", capacity: "", locationId: "" });
  const [newRegionPrice, setNewRegionPrice] = useState({ concertId: "", regionId: "", price: "" });
  const [newDiscount, setNewDiscount] = useState({ concertId: "", validUntil: "", discountPercentage: "10" });

  const [editLocation, setEditLocation] = useState<Location | null>(null);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [editCurrency, setEditCurrency] = useState<Currency | null>(null);
  const [editConcert, setEditConcert] = useState<Concert | null>(null);
  const [editRegion, setEditRegion] = useState<SeatingRegion | null>(null);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = () => {
    fetch("http://localhost:8080/api/locations").then((res) => res.json()).then(setLocations);
    fetch("http://localhost:8080/api/concert-categories").then((res) => res.json()).then(setCategories);
    fetch("http://localhost:8080/api/currencies").then((res) => res.json()).then(setCurrencies);
    fetch("http://localhost:8080/api/concerts").then((res) => res.json()).then(setConcerts);
    fetch("http://localhost:8080/api/seating-regions").then((res) => res.json()).then(setSeatingRegions);
  };

  const showSuccess = (msg: string) => {
    setSuccess(msg); setError("");
    setTimeout(() => setSuccess(""), 3000);
  };

  const showError = (msg: string) => {
    setError(msg); setSuccess("");
    setTimeout(() => setError(""), 5000);
  };

  const handleDelete = async (url: string, onSuccess: string) => {
    const res = await fetch(url, { method: "DELETE" });
    if (res.ok) { showSuccess(onSuccess); fetchAll(); }
    else {
      const data = await res.json();
      showError(data.error || "Greška pri brisanju.");
    }
  };

  const handleUpdate = async (url: string, body: any, onSuccess: string) => {
    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) { showSuccess(onSuccess); fetchAll(); }
    else showError("Greška pri izmeni.");
  };

  const tabs = [
    { id: "locations", label: "Lokacije" },
    { id: "regions", label: "Regioni sedenja" },
    { id: "categories", label: "Kategorije" },
    { id: "concerts", label: "Koncerti" },
    { id: "prices", label: "Cene karata" },
    { id: "discounts", label: "Popusti" },
    { id: "currencies", label: "Valute" },
  ];

  return (
    <main className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Admin panel</h1>

      {success && <p className="text-green-500 mb-4">{success}</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="flex flex-wrap gap-2 mb-8">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium ${activeTab === tab.id ? "bg-blue-600 text-white" : "border hover:bg-gray-100 hover:text-black"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "locations" && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Lokacije</h2>
          <div className="flex flex-col gap-2 mb-6">
            <input placeholder="Naziv lokacije" value={newLocation.name}
              onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
              className="border rounded p-2 bg-transparent" />
            <input placeholder="Adresa" value={newLocation.address}
              onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
              className="border rounded p-2 bg-transparent" />
            <button onClick={async () => {
              if (!newLocation.name || !newLocation.address) {
                showError("Naziv i adresa su obavezni!");
                return;
              }
              const res = await fetch("http://localhost:8080/api/locations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newLocation) });
              if (res.ok) { showSuccess("Lokacija dodana!"); setNewLocation({ name: "", address: "" }); fetchAll(); }
              else showError("Greška pri dodavanju lokacije.");
            }} className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Dodaj lokaciju</button>
          </div>
          <div className="flex flex-col gap-2">
            {locations.map((loc) => (
              <div key={loc.id} className="border rounded p-3">
                {editLocation?.id === loc.id ? (
                  <div className="flex flex-col gap-2">
                    <input value={editLocation.name} onChange={(e) => setEditLocation({ ...editLocation, name: e.target.value })} className="border rounded p-2 bg-transparent" />
                    <input value={editLocation.address} onChange={(e) => setEditLocation({ ...editLocation, address: e.target.value })} className="border rounded p-2 bg-transparent" />
                    <div className="flex gap-2">
                      <button onClick={() => { handleUpdate(`http://localhost:8080/api/locations/${loc.id}`, editLocation, "Lokacija izmenjena!"); setEditLocation(null); }} className="bg-green-600 text-white px-3 py-1 rounded text-sm">Sačuvaj</button>
                      <button onClick={() => setEditLocation(null)} className="border px-3 py-1 rounded text-sm">Otkaži</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{loc.name}</p>
                      <p className="text-sm text-gray-500">{loc.address}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditLocation(loc)} className="border px-3 py-1 rounded text-sm hover:bg-gray-100 hover:text-black">Izmeni</button>
                      <button onClick={() => handleDelete(`http://localhost:8080/api/locations/${loc.id}`, "Lokacija obrisana!")} className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">Obriši</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "regions" && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Regioni sedenja</h2>
          <div className="flex flex-col gap-2 mb-6">
            <input placeholder="Naziv regiona" value={newRegion.name} onChange={(e) => setNewRegion({ ...newRegion, name: e.target.value })} className="border rounded p-2 bg-transparent" />
            <input placeholder="Kapacitet" type="number" value={newRegion.capacity} onChange={(e) => setNewRegion({ ...newRegion, capacity: e.target.value })} className="border rounded p-2 bg-transparent" />
            <select value={newRegion.locationId} onChange={(e) => setNewRegion({ ...newRegion, locationId: e.target.value })} className="border rounded p-2 bg-white text-black">
              <option value="">Izaberi lokaciju</option>
              {locations.map((loc) => (<option key={loc.id} value={loc.id}>{loc.name}</option>))}
            </select>
            <button onClick={async () => {
              if (!newRegion.name || !newRegion.capacity || !newRegion.locationId) {
                showError("Naziv, kapacitet i lokacija su obavezni!");
                return;
              }
              const res = await fetch("http://localhost:8080/api/seating-regions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newRegion.name, capacity: Number(newRegion.capacity), location: { id: Number(newRegion.locationId) } }) });
              if (res.ok) { showSuccess("Region dodan!"); setNewRegion({ name: "", capacity: "", locationId: "" }); fetchAll(); }
              else showError("Greška pri dodavanju regiona.");
            }} className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Dodaj region</button>
          </div>
          <div className="flex flex-col gap-2">
            {seatingRegions.map((reg) => (
              <div key={reg.id} className="border rounded p-3">
                {editRegion?.id === reg.id ? (
                  <div className="flex flex-col gap-2">
                    <input value={editRegion.name} onChange={(e) => setEditRegion({ ...editRegion, name: e.target.value })} className="border rounded p-2 bg-transparent" />
                    <input type="number" value={editRegion.capacity} onChange={(e) => setEditRegion({ ...editRegion, capacity: Number(e.target.value) })} className="border rounded p-2 bg-transparent" />
                    <div className="flex gap-2">
                      <button onClick={() => { handleUpdate(`http://localhost:8080/api/seating-regions/${reg.id}`, { ...editRegion, location: { id: editRegion.location.id } }, "Region izmenjen!"); setEditRegion(null); }} className="bg-green-600 text-white px-3 py-1 rounded text-sm">Sačuvaj</button>
                      <button onClick={() => setEditRegion(null)} className="border px-3 py-1 rounded text-sm">Otkaži</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{reg.name}</p>
                      <p className="text-sm text-gray-500">Kapacitet: {reg.capacity} — {reg.location?.name}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditRegion(reg)} className="border px-3 py-1 rounded text-sm hover:bg-gray-100 hover:text-black">Izmeni</button>
                      <button onClick={() => handleDelete(`http://localhost:8080/api/seating-regions/${reg.id}`, "Region obrisan!")} className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">Obriši</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "categories" && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Kategorije koncerata</h2>
          <div className="flex gap-2 mb-6">
            <input placeholder="Naziv kategorije" value={newCategory.name} onChange={(e) => setNewCategory({ name: e.target.value })} className="border rounded p-2 bg-transparent flex-1" />
            <button onClick={async () => {
              if (!newCategory.name) {
                showError("Naziv kategorije je obavezan!");
                return;
              }
              const res = await fetch("http://localhost:8080/api/concert-categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newCategory) });
              if (res.ok) { showSuccess("Kategorija dodana!"); setNewCategory({ name: "" }); fetchAll(); }
              else showError("Greška pri dodavanju kategorije.");
            }} className="bg-blue-600 text-white px-4 rounded-lg hover:bg-blue-700">Dodaj</button>
          </div>
          <div className="flex flex-col gap-2">
            {categories.map((cat) => (
              <div key={cat.id} className="border rounded p-3">
                {editCategory?.id === cat.id ? (
                  <div className="flex gap-2">
                    <input value={editCategory.name} onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })} className="border rounded p-2 bg-transparent flex-1" />
                    <button onClick={() => { handleUpdate(`http://localhost:8080/api/concert-categories/${cat.id}`, editCategory, "Kategorija izmenjena!"); setEditCategory(null); }} className="bg-green-600 text-white px-3 py-1 rounded text-sm">Sačuvaj</button>
                    <button onClick={() => setEditCategory(null)} className="border px-3 py-1 rounded text-sm">Otkaži</button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <p className="font-medium">{cat.name}</p>
                    <div className="flex gap-2">
                      <button onClick={() => setEditCategory(cat)} className="border px-3 py-1 rounded text-sm hover:bg-gray-100 hover:text-black">Izmeni</button>
                      <button onClick={() => handleDelete(`http://localhost:8080/api/concert-categories/${cat.id}`, "Kategorija obrisana!")} className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">Obriši</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "concerts" && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Koncerti</h2>
          <div className="flex flex-col gap-2 mb-6">
            <input placeholder="Naziv koncerta" value={newConcert.name} onChange={(e) => setNewConcert({ ...newConcert, name: e.target.value })} className="border rounded p-2 bg-transparent" />
            <input type="date" value={newConcert.dateTime.split("T")[0] || ""} onChange={(e) => setNewConcert({ ...newConcert, dateTime: e.target.value + "T" + (newConcert.dateTime.split("T")[1] || "00:00") })} className="border rounded p-2 bg-white text-black" />
            <input type="time" value={newConcert.dateTime.split("T")[1] || ""} onChange={(e) => setNewConcert({ ...newConcert, dateTime: (newConcert.dateTime.split("T")[0] || "") + "T" + e.target.value })} className="border rounded p-2 bg-white text-black" />
            <select value={newConcert.locationId} onChange={(e) => setNewConcert({ ...newConcert, locationId: e.target.value })} className="border rounded p-2 bg-white text-black">
              <option value="">Izaberi lokaciju</option>
              {locations.map((loc) => (<option key={loc.id} value={loc.id}>{loc.name}</option>))}
            </select>
            <select value={newConcert.categoryId} onChange={(e) => setNewConcert({ ...newConcert, categoryId: e.target.value })} className="border rounded p-2 bg-white text-black">
              <option value="">Izaberi kategoriju</option>
              {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
            </select>
            <button onClick={async () => {
              if (!newConcert.name || !newConcert.dateTime || !newConcert.locationId || !newConcert.categoryId) {
                showError("Sva polja su obavezna!");
                return;
              }
              const res = await fetch("http://localhost:8080/api/concerts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newConcert.name, dateTime: newConcert.dateTime, location: { id: Number(newConcert.locationId) }, category: { id: Number(newConcert.categoryId) } }) });
              if (res.ok) { showSuccess("Koncert dodan!"); setNewConcert({ name: "", dateTime: "", locationId: "", categoryId: "" }); fetchAll(); }
              else showError("Greška pri dodavanju koncerta.");
            }} className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Dodaj koncert</button>
          </div>
          <div className="flex flex-col gap-2">
            {concerts.map((concert) => (
              <div key={concert.id} className="border rounded p-3">
                {editConcert?.id === concert.id ? (
                  <div className="flex flex-col gap-2">
                    <input value={editConcert.name} onChange={(e) => setEditConcert({ ...editConcert, name: e.target.value })} className="border rounded p-2 bg-transparent" />
                    <input type="date" value={editConcert.dateTime.split("T")[0] || ""} onChange={(e) => setEditConcert({ ...editConcert, dateTime: e.target.value + "T" + (editConcert.dateTime.split("T")[1] || "00:00") })} className="border rounded p-2 bg-white text-black" />
                    <input type="time" value={editConcert.dateTime.split("T")[1]?.substring(0, 5) || ""} onChange={(e) => setEditConcert({ ...editConcert, dateTime: (editConcert.dateTime.split("T")[0] || "") + "T" + e.target.value })} className="border rounded p-2 bg-white text-black" />
                    <div className="flex gap-2">
                      <button onClick={() => { handleUpdate(`http://localhost:8080/api/concerts/${concert.id}`, { ...editConcert, location: { id: editConcert.location.id }, category: { id: editConcert.category.id } }, "Koncert izmenjen!"); setEditConcert(null); }} className="bg-green-600 text-white px-3 py-1 rounded text-sm">Sačuvaj</button>
                      <button onClick={() => setEditConcert(null)} className="border px-3 py-1 rounded text-sm">Otkaži</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{concert.name}</p>
                      <p className="text-sm text-gray-500">{concert.location?.name} — {new Date(concert.dateTime).toLocaleString("sr-RS")}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditConcert(concert)} className="border px-3 py-1 rounded text-sm hover:bg-gray-100 hover:text-black">Izmeni</button>
                      <button onClick={() => handleDelete(`http://localhost:8080/api/concerts/${concert.id}`, "Koncert obrisan!")} className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">Obriši</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "prices" && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Cene karata po regionu</h2>
          <div className="flex flex-col gap-2 mb-6">
            <select value={newRegionPrice.concertId} onChange={(e) => setNewRegionPrice({ ...newRegionPrice, concertId: e.target.value })} className="border rounded p-2 bg-white text-black">
              <option value="">Izaberi koncert</option>
              {concerts.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
            <select value={newRegionPrice.regionId} onChange={(e) => setNewRegionPrice({ ...newRegionPrice, regionId: e.target.value })} className="border rounded p-2 bg-white text-black">
              <option value="">Izaberi region sedenja</option>
              {seatingRegions.map((r) => (<option key={r.id} value={r.id}>{r.name} ({r.location?.name})</option>))}
            </select>
            <input placeholder="Cena (RSD)" type="number" value={newRegionPrice.price} onChange={(e) => setNewRegionPrice({ ...newRegionPrice, price: e.target.value })} className="border rounded p-2 bg-transparent" />
            <button onClick={async () => {
              if (!newRegionPrice.concertId || !newRegionPrice.regionId || !newRegionPrice.price) {
                showError("Sva polja su obavezna!");
                return;
              }
              const res = await fetch("http://localhost:8080/api/concert-region-prices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ concert: { id: Number(newRegionPrice.concertId) }, region: { id: Number(newRegionPrice.regionId) }, price: Number(newRegionPrice.price) }) });
              if (res.ok) { showSuccess("Cena dodana!"); setNewRegionPrice({ concertId: "", regionId: "", price: "" }); }
              else showError("Greška pri dodavanju cene.");
            }} className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Dodaj cenu</button>
          </div>
        </div>
      )}

      {activeTab === "discounts" && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Popusti (10%)</h2>
          <div className="flex flex-col gap-2 mb-6">
            <select value={newDiscount.concertId} onChange={(e) => setNewDiscount({ ...newDiscount, concertId: e.target.value })} className="border rounded p-2 bg-white text-black">
              <option value="">Izaberi koncert</option>
              {concerts.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
            <label className="text-sm text-gray-500">Datum do kada važi popust:</label>
            <input type="date" value={newDiscount.validUntil} onChange={(e) => setNewDiscount({ ...newDiscount, validUntil: e.target.value })} className="border rounded p-2 bg-white text-black" />
            <button onClick={async () => {
              if (!newDiscount.concertId || !newDiscount.validUntil) {
                showError("Koncert i datum su obavezni!");
                return;
              }
              const res = await fetch("http://localhost:8080/api/discount-periods", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ concert: { id: Number(newDiscount.concertId) }, validUntil: newDiscount.validUntil, discountPercentage: Number(newDiscount.discountPercentage) }) });
              if (res.ok) { showSuccess("Popust dodan!"); setNewDiscount({ concertId: "", validUntil: "", discountPercentage: "10" }); }
              else showError("Greška pri dodavanju popusta.");
            }} className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Dodaj popust</button>
          </div>
        </div>
      )}

      {activeTab === "currencies" && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Valute</h2>
          <div className="flex flex-col gap-2 mb-6">
            <input placeholder="Kod valute (npr. EUR)" value={newCurrency.code} onChange={(e) => setNewCurrency({ ...newCurrency, code: e.target.value })} className="border rounded p-2 bg-transparent" />
            <input placeholder="Naziv valute" value={newCurrency.name} onChange={(e) => setNewCurrency({ ...newCurrency, name: e.target.value })} className="border rounded p-2 bg-transparent" />
            <button onClick={async () => {
              if (!newCurrency.code || !newCurrency.name) {
                showError("Kod i naziv valute su obavezni!");
                return;
              }
              const res = await fetch("http://localhost:8080/api/currencies", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newCurrency) });
              if (res.ok) { showSuccess("Valuta dodana!"); setNewCurrency({ code: "", name: "" }); fetchAll(); }
              else showError("Greška pri dodavanju valute.");
            }} className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Dodaj valutu</button>
          </div>
          <div className="flex flex-col gap-2">
            {currencies.map((cur) => (
              <div key={cur.id} className="border rounded p-3">
                {editCurrency?.id === cur.id ? (
                  <div className="flex gap-2">
                    <input value={editCurrency.code} onChange={(e) => setEditCurrency({ ...editCurrency, code: e.target.value })} className="border rounded p-2 bg-transparent w-24" />
                    <input value={editCurrency.name} onChange={(e) => setEditCurrency({ ...editCurrency, name: e.target.value })} className="border rounded p-2 bg-transparent flex-1" />
                    <button onClick={() => { handleUpdate(`http://localhost:8080/api/currencies/${cur.id}`, editCurrency, "Valuta izmenjena!"); setEditCurrency(null); }} className="bg-green-600 text-white px-3 py-1 rounded text-sm">Sačuvaj</button>
                    <button onClick={() => setEditCurrency(null)} className="border px-3 py-1 rounded text-sm">Otkaži</button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <p className="font-medium">{cur.name} ({cur.code})</p>
                    <div className="flex gap-2">
                      <button onClick={() => setEditCurrency(cur)} className="border px-3 py-1 rounded text-sm hover:bg-gray-100 hover:text-black">Izmeni</button>
                      <button onClick={() => handleDelete(`http://localhost:8080/api/currencies/${cur.id}`, "Valuta obrisana!")} className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">Obriši</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}