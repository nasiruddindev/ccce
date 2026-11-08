import React, { useState } from "react";
import { InventoryProvider, useInventory } from "./context/InventoryContext";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import DashboardView from "./components/DashboardView";
import InventoryView from "./components/InventoryView";
import TransferView from "./components/TransferView";
import SiteUsageView from "./components/SiteUsageView";
import BranchesView from "./components/BranchesView";
import NewTransferModal from "./components/NewTransferModal";
import ChallanModal from "./components/ChallanModal";
import AddProductModal from "./components/AddProductModal";
import StockInModal from "./components/StockInModal";
import RecordUsageModal from "./components/RecordUsageModal";
import FirebaseConfigModal from "./components/FirebaseConfigModal";

function MainAppContent() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isNewTransferOpen, setIsNewTransferOpen] = useState(false);
  const [selectedProductForTransfer, setSelectedProductForTransfer] = useState(null);
  
  const [isChallanModalOpen, setIsChallanModalOpen] = useState(false);
  const [selectedTransferForChallan, setSelectedTransferForChallan] = useState(null);

  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isStockInOpen, setIsStockInOpen] = useState(false);

  // Material consumption state
  const [isRecordUsageOpen, setIsRecordUsageOpen] = useState(false);
  const [selectedProductForUsage, setSelectedProductForUsage] = useState(null);
  const [selectedLocationForUsage, setSelectedLocationForUsage] = useState(null);

  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);

  const { setSelectedLocation } = useInventory();

  // Handle open transfer modal from specific product button
  const handleOpenTransferWithItem = (product) => {
    setSelectedProductForTransfer(product);
    setIsNewTransferOpen(true);
  };

  // Handle open site usage modal from specific product / location
  const handleOpenRecordUsageWithItem = (product = null, locationId = null) => {
    setSelectedProductForUsage(product);
    setSelectedLocationForUsage(locationId);
    setIsRecordUsageOpen(true);
  };

  // Handle view challan
  const handleViewChallan = (transfer) => {
    setSelectedTransferForChallan(transfer);
    setIsChallanModalOpen(true);
  };

  // When a transfer is created, offer to preview its gate pass
  const handleTransferCreated = (newTransfer) => {
    setSelectedTransferForChallan(newTransfer);
    setIsChallanModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0F1217] text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onOpenNewTransfer={() => {
          setSelectedProductForTransfer(null);
          setIsNewTransferOpen(true);
        }}
        onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
      />

      {/* Main Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
        />

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === "dashboard" && (
            <DashboardView
              onOpenNewTransfer={() => {
                setSelectedProductForTransfer(null);
                setIsNewTransferOpen(true);
              }}
              onOpenAddProduct={() => setIsAddProductOpen(true)}
              onViewChallan={handleViewChallan}
              onOpenRecordUsage={() => handleOpenRecordUsageWithItem()}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === "transfers" && (
            <TransferView
              onOpenNewTransfer={() => {
                setSelectedProductForTransfer(null);
                setIsNewTransferOpen(true);
              }}
              onViewChallan={handleViewChallan}
            />
          )}

          {activeTab === "inventory" && (
            <InventoryView
              onOpenNewTransferWithItem={handleOpenTransferWithItem}
              onOpenAddProduct={() => setIsAddProductOpen(true)}
              onOpenStockIn={() => setIsStockInOpen(true)}
              onOpenRecordUsageWithItem={handleOpenRecordUsageWithItem}
            />
          )}

          {activeTab === "usage" && (
            <SiteUsageView
              onOpenRecordUsage={() => handleOpenRecordUsageWithItem()}
            />
          )}

          {activeTab === "branches" && (
            <BranchesView
              onOpenNewTransfer={() => {
                setSelectedProductForTransfer(null);
                setIsNewTransferOpen(true);
              }}
              setSelectedLocation={setSelectedLocation}
              setActiveTab={setActiveTab}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <NewTransferModal
        isOpen={isNewTransferOpen}
        onClose={() => {
          setIsNewTransferOpen(false);
          setSelectedProductForTransfer(null);
        }}
        initialSelectedProduct={selectedProductForTransfer}
        onTransferSuccess={handleTransferCreated}
      />

      <ChallanModal
        isOpen={isChallanModalOpen}
        transfer={selectedTransferForChallan}
        onClose={() => {
          setIsChallanModalOpen(false);
          setSelectedTransferForChallan(null);
        }}
      />

      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
      />

      <StockInModal
        isOpen={isStockInOpen}
        onClose={() => setIsStockInOpen(false)}
      />

      <RecordUsageModal
        isOpen={isRecordUsageOpen}
        onClose={() => {
          setIsRecordUsageOpen(false);
          setSelectedProductForUsage(null);
          setSelectedLocationForUsage(null);
        }}
        initialProduct={selectedProductForUsage}
        initialLocationId={selectedLocationForUsage}
      />

      <FirebaseConfigModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <InventoryProvider>
      <MainAppContent />
    </InventoryProvider>
  );
}
