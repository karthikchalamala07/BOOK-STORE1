import { supabase, isSupabaseConfigValid } from "../lib/supabase";

export interface CreateOrderPayload {
  userId?: string;
  customerName: string;
  customerEmail: string;
  items: {
    bookId: string;
    format: "physical" | "ebook" | "combo";
    quantity: number;
    price: number;
    title: string;
  }[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

function generateRandomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "SV-";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const orderService = {
  async createOrder(payload: CreateOrderPayload) {
    const orderNumber = `SVR-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(100000 + Math.random() * 900000)}`;
    const digitalCode = generateRandomCode();

    if (!isSupabaseConfigValid) {
      const receiptObj = {
        receiptNumber: orderNumber,
        orderId: orderNumber,
        digitalAccessCode: digitalCode,
        customerName: payload.customerName,
        customerEmail: payload.customerEmail,
        total: payload.total,
        createdAt: new Date().toISOString(),
        items: payload.items
      };
      
      const localReceipts = JSON.parse(localStorage.getItem("storyvault_receipts") || "[]");
      localReceipts.unshift(receiptObj);
      localStorage.setItem("storyvault_receipts", JSON.stringify(localReceipts));

      return { orderNumber, digitalCode, receipt: receiptObj };
    }

    try {
      const { data: orderData, error: orderErr } = await supabase
        .from("orders")
        .insert({
          order_number: orderNumber,
          user_id: payload.userId || null,
          subtotal: payload.subtotal,
          shipping: payload.shipping,
          tax: payload.tax,
          total: payload.total,
          status: "Paid",
          payment_status: "Completed"
        })
        .select()
        .single();

      if (orderErr || !orderData) throw orderErr;

      for (const item of payload.items) {
        await supabase.from("order_items").insert({
          order_id: orderData.id,
          book_id: item.bookId,
          format: item.format,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity
        });

        if ((item.format === "ebook" || item.format === "combo") && payload.userId) {
          const { data: codeData } = await supabase
            .from("activation_codes")
            .insert({
              code: digitalCode,
              book_id: item.bookId,
              order_id: orderData.id,
              user_id: payload.userId,
              status: "active",
              activated_at: new Date().toISOString()
            })
            .select()
            .single();

          await supabase.from("digital_entitlements").insert({
            user_id: payload.userId,
            book_id: item.bookId,
            order_id: orderData.id,
            activation_code_id: codeData?.id || null,
            status: "active"
          });
        }
      }

      await supabase.from("receipts").insert({
        receipt_number: orderNumber,
        order_id: orderData.id,
        user_id: payload.userId || null,
        customer_name: payload.customerName,
        customer_email: payload.customerEmail,
        total: payload.total
      });

      return {
        orderNumber,
        digitalCode,
        receipt: {
          receiptNumber: orderNumber,
          orderId: orderNumber,
          digitalAccessCode: digitalCode,
          customerName: payload.customerName,
          customerEmail: payload.customerEmail,
          total: payload.total,
          createdAt: new Date().toISOString(),
          items: payload.items
        }
      };
    } catch (_) {
      const receiptObj = {
        receiptNumber: orderNumber,
        orderId: orderNumber,
        digitalAccessCode: digitalCode,
        customerName: payload.customerName,
        customerEmail: payload.customerEmail,
        total: payload.total,
        createdAt: new Date().toISOString(),
        items: payload.items
      };
      return { orderNumber, digitalCode, receipt: receiptObj };
    }
  }
};

export default orderService;