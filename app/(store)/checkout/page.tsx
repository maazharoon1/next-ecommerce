'use client'
import useBasketStore from "@/store/store";
import { useUser } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createCheckOutSession } from "@/actions/createCheckoutSession";
import type { Metadata } from "@/actions/createCheckoutSession";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { imageUrl } from "@/lib/imageUrl";
import { toast } from "sonner";
import { getUserByClerkId, Address } from "@/lib/user";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InfoIcon, TagIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Loader from "@/components/Loader";
import { OrderSummaryPopup } from "@/components/OrderSummaryPopup";

interface ShippingAddress {
    title: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
}

function CheckoutPage() {
    // Store hooks
    const groupedItems = useBasketStore((state) => state.getGroupedItems())
    const removeItem = useBasketStore((state) => state.removeItem)
    
    // Auth hooks
    const { isSignedIn } = useAuth()
    const { user } = useUser()
    const router = useRouter()
    
    // State hooks - define ALL of them at the top level
    const [isClient, setIsClient] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isSavingUser, setIsSavingUser] = useState(false)
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState("card")
    const [userAddresses, setUserAddresses] = useState<Address[]>([])
    const [selectedAddressKey, setSelectedAddressKey] = useState<string>("")
    const [couponCode, setCouponCode] = useState("")
    const [appliedCoupon, setAppliedCoupon] = useState<{
        code: string;
        discountAmount: number;
        title?: string;
        description?: string;
    } | null>(null)
    const [discountAmount, setDiscountAmount] = useState(0)
    const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
        title: "",
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
        phone: ""
    })
    const [userDetails, setUserDetails] = useState({
        fullName: "",
        email: ""
    })
    const [isOrderSummaryOpen, setIsOrderSummaryOpen] = useState(false);

    // Set client-side flag
    useEffect(() => {
        setIsClient(true)
    }, [])
    
    // Check for items with zero quantity
    useEffect(() => {
        if (isClient) {
            groupedItems.forEach(item => {
                if(item.quantity <= 0){
                    removeItem(item.product._id)
                }
            })
        }
    }, [groupedItems, removeItem, isClient])
    
    // Fetch user data and addresses
    useEffect(() => {
        if (isClient && user) {
            setUserDetails({
                fullName: user.fullName || "",
                email: user.emailAddresses[0]?.emailAddress || ""
            })
            
            // Fetch user addresses
            const fetchUserAddresses = async () => {
                if (user.id) {
                    const userData = await getUserByClerkId(user.id);
                    if (userData && userData.addresses) {
                        setUserAddresses(userData.addresses);
                        if (userData.addresses.length > 0) {
                            setSelectedAddressKey(userData.addresses[0]._key);
                            // Pre-fill with first address
                            setShippingAddress({
                                title: userData.addresses[0].title,
                                street: userData.addresses[0].street,
                                city: userData.addresses[0].city,
                                state: userData.addresses[0].state,
                                zipCode: userData.addresses[0].zipCode,
                                country: userData.addresses[0].country,
                                phone: userData.addresses[0].phone.toString()
                            });
                        }
                    }
                }
            };
            
            fetchUserAddresses();
        }
    }, [user, isClient])
    
    // Early return for server-side rendering
    if (!isClient) {
        return <Loader/>;
    }
    
    // Authentication and empty basket checks (not hooks, so these can be conditional)
    if(!isSignedIn) {
        router.push('/');
        return <Loader/>;
    }
    
    const totalQuantity = groupedItems.reduce((total, item) => total + item.quantity, 0)
    
    if(totalQuantity === 0) {
        router.push('/');
        return <Loader/>;
    }
    
    // Handle address selection change
    const handleAddressChange = (addressKey: string) => {
        setSelectedAddressKey(addressKey);
        const selectedAddress = userAddresses.find(addr => addr._key === addressKey);
        if (selectedAddress) {
            setShippingAddress({
                title: selectedAddress.title,
                street: selectedAddress.street,
                city: selectedAddress.city,
                state: selectedAddress.state,
                zipCode: selectedAddress.zipCode,
                country: selectedAddress.country,
                phone: selectedAddress.phone.toString()
            });
        }
    };
    
    // Add phone validation function
    const validatePhoneNumber = (phone: string) => {
        // Remove any non-digit characters
        const cleanedNumber = phone.replace(/\D/g, '');
        // Check if it's a valid phone number (minimum 10 digits, maximum 15)
        return /^\d{10,15}$/.test(cleanedNumber);
    }

    // Handle phone number change with validation
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Only allow digits and common phone number characters
        const sanitizedValue = value.replace(/[^\d+\-\(\) ]/g, '');
        setShippingAddress(prev => ({...prev, phone: sanitizedValue}));
    }
    
    const handleSaveUserInfo = async () => {
        if (!user) return;
        
        // Validate form fields
        if (!userDetails.fullName || !userDetails.email || 
            !shippingAddress.street || !shippingAddress.city || 
            !shippingAddress.state || !shippingAddress.zipCode || 
            !shippingAddress.country || !shippingAddress.phone) {
            toast.error("Please fill in all required fields");
            return;
        }

        // Validate phone number
        if (!validatePhoneNumber(shippingAddress.phone)) {
            toast.error("Please enter a valid phone number (minimum 10 digits)");
            return;
        }
        
        setIsSavingUser(true);
        try {
            const response = await fetch("/api/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: userDetails.fullName,
                    email: userDetails.email,
                    clerkUserId: user.id,
                    address: shippingAddress
                })
            });
            
            if (response.ok) {
                toast.success("Address saved successfully!");
                // Refresh addresses after saving
                const userData = await getUserByClerkId(user.id);
                if (userData && userData.addresses) {
                    setUserAddresses(userData.addresses);
                    // Select the newly added address
                    const newAddressKey = userData.addresses[userData.addresses.length - 1]._key;
                    setSelectedAddressKey(newAddressKey);
                }
            } else {
                throw new Error("Failed to save user information");
            }
        } catch (error) {
            console.error("Error saving user info:", error);
            toast.error("Failed to save user information");
        } finally {
            setIsSavingUser(false);
        }
    };
      
    // Handle coupon code validation
    const validateCouponCode = async () => {
        if (!couponCode.trim()) {
            toast.error("Please enter a coupon code");
            return;
        }
        
        setIsValidatingCoupon(true);
        try {
            const response = await fetch(`/api/validate-coupon?code=${encodeURIComponent(couponCode.trim())}`);
            const data = await response.json();
            
            if (response.ok && data.valid) {
                setAppliedCoupon(data.coupon);
                
                // Calculate discount
                const rawTotal = groupedItems.reduce(
                    (total, item) => total + ((item.product.price ?? 0) * item.quantity), 
                    0
                );
                const discountValue = (rawTotal * data.coupon.discountAmount) / 100;
                setDiscountAmount(discountValue);
                
                toast.success(`Coupon applied: ${data.coupon.discountAmount}% off`);
            } else {
                setAppliedCoupon(null);
                setDiscountAmount(0);
                toast.error(data.error || "Invalid coupon code");
            }
        } catch (error) {
            console.error("Error validating coupon:", error);
            toast.error("Failed to validate coupon code");
        } finally {
            setIsValidatingCoupon(false);
        }
    };
    
    // Clear applied coupon
    const clearCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode("");
        setDiscountAmount(0);
    };
      
    const handleCheckout = () => {
        // Validate shipping address
        if(!shippingAddress.street || !shippingAddress.city || !shippingAddress.state || 
          !shippingAddress.zipCode || !shippingAddress.country) {
            toast.error("Please fill all shipping address fields");
            return;
        }
        
        setIsOrderSummaryOpen(true);
    };
    
    const processCheckout = async () => {
        setIsOrderSummaryOpen(false);
        
        if (paymentMethod === "card") {
            if(!isSignedIn || !user) {
                toast.error("You must be signed in to checkout");
                return;
            }
            
            setIsLoading(true);
            try {
                const metadata: Metadata = {
                    orderNumber: crypto.randomUUID(),
                    customerName: user?.fullName ?? "Unknown",
                    customerEmail: user?.emailAddresses[0]?.emailAddress ?? "Unknown",
                    clerkUserID: user.id,
                    shippingTitle: shippingAddress.title,
                    shippingStreet: shippingAddress.street,
                    shippingCity: shippingAddress.city,
                    shippingState: shippingAddress.state,
                    shippingZipCode: shippingAddress.zipCode,
                    shippingCountry: shippingAddress.country,
                    shippingPhone: parseInt(shippingAddress.phone.replace(/\D/g, ''))
                };
                
                const checkoutUrl = await createCheckOutSession(groupedItems, metadata);
                
                if(checkoutUrl) {
                    window.location.href = checkoutUrl;
                } else {
                    throw new Error("Failed to create checkout session");
            }
          } catch (error) {
                console.error("Error during checkout:", error); 
                toast.error("Error processing payment. Please try again.");
            } finally {
                setIsLoading(false);
          }
        } else {
            // Handle cash on delivery
            if (!user) {
                toast.error("You must be signed in to checkout");
                return;
            }
            
            setIsLoading(true);
            try {
                const orderNumber = crypto.randomUUID();
                const rawTotal = groupedItems.reduce(
                    (total, item) => (total + ((item.product.price ?? 0) * item.quantity)), 
                    0
                );
                const totalPrice = rawTotal - discountAmount;
                const response = await fetch("/api/create-order", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        orderNumber,
                        customerName: user.fullName,
                        customerEmail: user.emailAddresses[0]?.emailAddress,
                        clerkUserId: user.id,
                        shippingAddress,
                        products: groupedItems,
                        totalPrice: totalPrice,
                        amountDiscount: discountAmount,
                        couponCode: appliedCoupon?.code || "",
                        currency: "USD",
                        shippingPhone: shippingAddress.phone
                    })
                });
                
                const result = await response.json();
                
                if (response.ok && result.orderId) {
                    // Redirect to success page with order details
                    router.push(`/order-success?orderId=${result.orderId}&orderNumber=${orderNumber}`);
                } else {
                    throw new Error(result.error || "Failed to create order");
                }
            } catch (error) {
                console.error("Error creating order:", error);
                toast.error("Failed to create order. Please try again.");
            } finally {
                setIsLoading(false);
            }
        }
    };
    
    // Calculate totals
    const subtotal = groupedItems.reduce(
        (total, item) => total + ((item.product.price ?? 0) * item.quantity), 
        0
    );
    const total = subtotal - discountAmount;
    
    return (
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>

          {/* Order Items Section */}
          <div className="mb-8 bg-white p-6 rounded-lg border shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Order Items</h2>
            <div className="space-y-4">
              {groupedItems.map(item => (
                <div 
                  key={item.product._id}
                  className="flex items-center justify-between py-4 border-b last:border-b-0"
                >
                  <div className="flex items-center space-x-4">
                    {item.product.image && (
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <Image
                          src={imageUrl(item.product.image).url()}
                          alt={item.product.product || 'Product image'}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium">{item.product.product}</h3>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${((item.product.price ?? 0) * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
              
              {/* Order Summary Calculation */}
              <div className="pt-4 mt-4 border-t">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                
                {appliedCoupon && (
                  <div className="flex justify-between text-red-600 my-2">
                    <span>Discount ({appliedCoupon.discountAmount}% off)</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-gray-600 my-2">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* User Information */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={userDetails.fullName}
                    className="bg-gray-100"
                    readOnly
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={userDetails.email}
                    className="bg-gray-100"
                    readOnly
                  />
                </div>
              </form>
            </div>

            {/* Shipping Address */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
              
              {/* Saved Addresses */}
              {userAddresses.length > 0 && (
                <div className="mb-4">
                  <Label htmlFor="savedAddress">Select Saved Address</Label>
                  <Select value={selectedAddressKey} onValueChange={handleAddressChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select an address" />
                    </SelectTrigger>
                    <SelectContent>
                      {userAddresses.map((addr) => (
                        <SelectItem key={addr._key} value={addr._key}>
                          {addr.title}: {addr.street}, {addr.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Address Title</Label>
                  <Input 
                    id="title" 
                    value={shippingAddress.title}
                    onChange={(e) => setShippingAddress({...shippingAddress, title: e.target.value})}
                    placeholder="Home, Office, etc."
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input 
                    id="street" 
                    value={shippingAddress.street}
                    onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})}
                    placeholder="Enter your street address"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input 
                      id="city"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                      placeholder="Enter your city"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province</Label>
                    <Input 
                      id="state"
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                      placeholder="Enter your state/province"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                    <Input 
                      id="zipCode"
                      value={shippingAddress.zipCode}
                      onChange={(e) => setShippingAddress({...shippingAddress, zipCode: e.target.value})}
                      placeholder="Enter your ZIP code"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input 
                      id="country"
                      value={shippingAddress.country}
                      onChange={(e) => setShippingAddress({...shippingAddress, country: e.target.value})}
                      placeholder="Enter your country"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone"
                      type="tel"
                      value={shippingAddress.phone}
                      onChange={handlePhoneChange}
                      placeholder="Enter your phone number (e.g., +1 234 567 8900)"
                      pattern="[0-9+\-\(\) ]+"
                      required
                    />
                    <p className="text-sm text-gray-500">Enter at least 10 digits</p>
                  </div>
                </div>
                
                {/* Save User Info Button */}
                <Button 
                  type="button" 
                  onClick={handleSaveUserInfo}
                  className="mt-2 bg-green-500 hover:bg-green-600"
                  disabled={isSavingUser}
                >
                  {isSavingUser ? "Saving..." : "Save Address"}
                </Button>
              </form>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
            <div className="flex space-x-4">
              <div className="flex items-center">
                <input 
                  type="radio" 
                  id="card" 
                  name="paymentMethod" 
                  value="card" 
                  checked={paymentMethod === "card"}
                  onChange={() => setPaymentMethod("card")}
                  className="mr-2"
                />
                <Label htmlFor="card">Credit/Debit Card</Label>
              </div>
              <div className="flex items-center">
                <input 
                  type="radio" 
                  id="cashOnDelivery" 
                  name="paymentMethod" 
                  value="cash"
                  checked={paymentMethod === "cash"} 
                  onChange={() => setPaymentMethod("cash")}
                  className="mr-2"
                />
                <Label htmlFor="cashOnDelivery">Cash on Delivery</Label>
              </div>
            </div>
            
            {paymentMethod === "card" && (
              <Alert className="mt-4 bg-blue-50 border-blue-200">
                <InfoIcon className="h-4 w-4 text-blue-500" />
                <AlertDescription className="text-blue-700">
                  Coupon code can be entered on the Stripe checkout page.
                </AlertDescription>
              </Alert>
            )}
            
            {/* Coupon Code Section - Only for Cash on Delivery */}
            {paymentMethod === "cash" && (
              <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                <h3 className="text-md font-medium mb-3 flex items-center">
                  <TagIcon className="h-4 w-4 mr-2 text-gray-600" />
                  Apply Coupon Code
                </h3>
                
                {!appliedCoupon ? (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      onClick={validateCouponCode}
                      disabled={isValidatingCoupon || !couponCode.trim()}
                      variant="outline"
                    >
                      {isValidatingCoupon ? "Validating..." : "Apply"}
                    </Button>
                  </div>
                ) : (
                  <div className="bg-green-50 p-3 rounded-md border border-green-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-green-700">{appliedCoupon.code}</p>
                        <p className="text-sm text-green-600">{appliedCoupon.discountAmount}% off your order</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-green-200 text-green-700 hover:bg-green-100"
                        onClick={clearCoupon}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Add OrderSummaryPopup */}
          <OrderSummaryPopup
              isOpen={isOrderSummaryOpen}
              onClose={() => setIsOrderSummaryOpen(false)}
              onConfirm={processCheckout}
              shippingAddress={shippingAddress}
              paymentMethod={paymentMethod}
              subtotal={subtotal}
              discount={appliedCoupon ? {
                  code: appliedCoupon.code,
                  amount: discountAmount,
                  percentage: appliedCoupon.discountAmount
              } : undefined}
              total={total}
              isLoading={isLoading}
          />

          {/* Update Checkout Button */}
          <div className="mt-8">
            <Button 
              onClick={handleCheckout}
              className="w-full md:w-auto px-8 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
              disabled={isLoading}
            >
                  {isLoading ? "Processing..." : "Review Order"}
            </Button>
          </div>
        </div>
    )
}

export default CheckoutPage