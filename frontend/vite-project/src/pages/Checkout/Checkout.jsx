import React from "react";
import StoreShell from "../../components/StoreShell";
import useCheckout from "./hooks/useCheckout";
import EmptyCheckout from "./components/EmptyCheckout";
import AddressStep from "./components/AddressStep";
import ReviewStep from "./components/ReviewStep";
import PaymentStep from "./components/PaymentStep";
import OrderSummary from "./components/OrderSummary";
import MobileCheckoutBar from "./components/MobileCheckoutBar";
import "./Checkout.css";

export default function Checkout() {
  const checkout = useCheckout();

  if (checkout.items.length === 0) {
    return (
      <StoreShell>
        <EmptyCheckout onBrowseShop={() => checkout.navigate("/shop")} />
      </StoreShell>
    );
  }

  return (
    <StoreShell>
      <div className="sz-co-page">
        <div className="sz-co-wrap">
          <div className="sz-co-grid-container">
            {/* Left Column — 70% width on desktop */}
            <div className="sz-co-left-col">
              <AddressStep
                activeStep={checkout.activeStep}
                setActiveStep={checkout.setActiveStep}
                addressComplete={checkout.addressComplete}
                fullName={checkout.fullName}
                city={checkout.city}
                state={checkout.state}
                pincode={checkout.pincode}
                phone={checkout.phone}
                addresses={checkout.addresses}
                selectedAddressId={checkout.selectedAddressId}
                addressEditing={checkout.addressEditing}
                setAddressEditing={checkout.setAddressEditing}
                saveToProfile={checkout.saveToProfile}
                setSaveToProfile={checkout.setSaveToProfile}
                handleSelectSavedAddress={checkout.handleSelectSavedAddress}
                handleAddressSubmit={checkout.handleAddressSubmit}
                handleCancelAddressEdit={checkout.handleCancelAddressEdit}
                handleStepClick={checkout.handleStepClick}
                register={checkout.register}
                setValue={checkout.setValue}
                errors={checkout.errors}
                reset={checkout.reset}
                addressType={checkout.addressType}
                loading={checkout.loading}
              />

              <ReviewStep
                activeStep={checkout.activeStep}
                setActiveStep={checkout.setActiveStep}
                items={checkout.items}
                estimatedDeliveryDate={checkout.estimatedDeliveryDate}
                handleStepClick={checkout.handleStepClick}
              />

              <PaymentStep
                activeStep={checkout.activeStep}
                paymentMethod={checkout.paymentMethod}
                setPaymentMethod={checkout.setPaymentMethod}
                razorpayReady={checkout.razorpayReady}
                codCaptcha={checkout.codCaptcha}
                setCodCaptcha={checkout.setCodCaptcha}
                codCaptchaInput={checkout.codCaptchaInput}
                setCodCaptchaInput={checkout.setCodCaptchaInput}
                handleStepClick={checkout.handleStepClick}
              />
            </div>

            {/* Right Column — 30% width on desktop */}
            <div className="sz-co-right-col">
              <OrderSummary
                items={checkout.items}
                pricing={checkout.pricing}
                subtotal={checkout.subtotal}
                discount={checkout.discount}
                finalTotal={checkout.finalTotal}
                paymentMethod={checkout.paymentMethod}
                loading={checkout.loading}
                payDisabled={checkout.payDisabled}
                estimatedDeliveryDate={checkout.estimatedDeliveryDate}
                handleSubmitOrder={checkout.handleSubmitOrder}
              />
            </div>
          </div>
        </div>

        {/* Mobile Sticky Action Bar */}
        <MobileCheckoutBar
          finalTotal={checkout.finalTotal}
          pricing={checkout.pricing}
          paymentMethod={checkout.paymentMethod}
          loading={checkout.loading}
          payDisabled={checkout.payDisabled}
          handleSubmitOrder={checkout.handleSubmitOrder}
        />
      </div>
    </StoreShell>
  );
}
