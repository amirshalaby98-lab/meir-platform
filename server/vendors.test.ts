import { describe, it, expect, beforeAll } from "vitest";
import { vendorsRouter } from "./modules/vendors";
import { getDb } from "./db";

describe("Vendors Router", () => {
  let db: any;

  beforeAll(async () => {
    db = await getDb();
  });

  it("should register a new vendor", async () => {
    const caller = vendorsRouter.createCaller({} as any);
    const result = await caller.register({
      vendorType: "parts_shop",
      businessName: "متجر القطع الأصلية",
      ownerName: "محمد علي",
      phone: "0543257872",
      email: `test-${Date.now()}@example.com`,
      city: "الرياض",
      area: "الروضة",
      address: "شارع الملك فهد",
      description: "متجر متخصص في قطع غيار السيارات الأصلية",
      commercialLicense: "123456",
      taxId: "987654",
    });

    expect(result.success).toBe(true);
    expect(result.vendorId).toBeDefined();
  });

  it("should get pending vendors", async () => {
    const caller = vendorsRouter.createCaller({} as any);
    const result = await caller.getPendingVendors();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should get vendor profile", async () => {
    const caller = vendorsRouter.createCaller({} as any);
    
    // Register a vendor first
    const registerResult = await caller.register({
      vendorType: "technician",
      businessName: "ورشة الصيانة",
      ownerName: "أحمد محمد",
      phone: "0543257873",
      email: `test-tech-${Date.now()}@example.com`,
      city: "جدة",
      area: "الشاطئ",
    });

    if (registerResult.vendorId) {
      const profile = await caller.getProfile({ vendorId: registerResult.vendorId });
      expect(profile.businessName).toBe("ورشة الصيانة");
      expect(profile.status).toBe("pending");
    }
  });

  it("should get approved vendors by type", async () => {
    const caller = vendorsRouter.createCaller({} as any);
    const result = await caller.getApprovedByType({ vendorType: "parts_shop" });
    expect(Array.isArray(result)).toBe(true);
  });

  it("should add vendor service", async () => {
    const caller = vendorsRouter.createCaller({} as any);
    
    // Register a vendor first
    const registerResult = await caller.register({
      vendorType: "junkyard",
      businessName: "التشليح المعتمد",
      ownerName: "فهد الدعيع",
      phone: "0543257874",
      email: `test-junkyard-${Date.now()}@example.com`,
      city: "الدمام",
      area: "الخليج",
    });

    if (registerResult.vendorId) {
      const result = await caller.addService({
        vendorId: registerResult.vendorId,
        serviceName: "شراء السيارات المستعملة",
        description: "نشتري السيارات المستعملة بأفضل الأسعار",
        price: 5000,
      });

      expect(result.success).toBe(true);
    }
  });

  it("should get vendor services", async () => {
    const caller = vendorsRouter.createCaller({} as any);
    
    // Register a vendor and add service
    const registerResult = await caller.register({
      vendorType: "parts_shop",
      businessName: "متجر القطع 2",
      ownerName: "علي محمد",
      phone: "0543257875",
      email: `test-parts2-${Date.now()}@example.com`,
      city: "الرياض",
      area: "النخيل",
    });

    if (registerResult.vendorId) {
      await caller.addService({
        vendorId: registerResult.vendorId,
        serviceName: "بطاريات السيارات",
        description: "بطاريات أصلية وموثوقة",
      });

      const services = await caller.getServices({ vendorId: registerResult.vendorId });
      expect(Array.isArray(services)).toBe(true);
      expect(services.length).toBeGreaterThan(0);
    }
  });

  it("should update vendor profile", async () => {
    const caller = vendorsRouter.createCaller({} as any);
    
    // Register a vendor
    const registerResult = await caller.register({
      vendorType: "technician",
      businessName: "ورشة الصيانة 2",
      ownerName: "محمود علي",
      phone: "0543257876",
      email: `test-tech2-${Date.now()}@example.com`,
      city: "الرياض",
      area: "الملز",
    });

    if (registerResult.vendorId) {
      const result = await caller.updateProfile({
        vendorId: registerResult.vendorId,
        businessName: "ورشة الصيانة المتقدمة",
        description: "ورشة متخصصة في صيانة السيارات الحديثة",
      });

      expect(result.success).toBe(true);
    }
  });

  it("should get all vendors", async () => {
    const caller = vendorsRouter.createCaller({} as any);
    const result = await caller.getAllVendors();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should get vendor details with documents and services", async () => {
    const caller = vendorsRouter.createCaller({} as any);
    
    // Register a vendor
    const registerResult = await caller.register({
      vendorType: "parts_shop",
      businessName: "متجر القطع 3",
      ownerName: "سارة محمد",
      phone: "0543257877",
      email: `test-parts3-${Date.now()}@example.com`,
      city: "جدة",
      area: "الروضة",
    });

    if (registerResult.vendorId) {
      const details = await caller.getVendorDetails({ vendorId: registerResult.vendorId });
      expect(details.vendor).toBeDefined();
      expect(Array.isArray(details.documents)).toBe(true);
      expect(Array.isArray(details.services)).toBe(true);
    }
  });
});
