import { useState } from "react";
import { View, Pressable, Alert, Linking } from "react-native";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Screen,
  Txt,
  Row,
  IconButton,
  Icon,
  Card,
  Section,
  Badge,
  Loading,
  ErrorState,
  Empty,
  Button,
  type IconName,
} from "../../src/components/ui";
import { useApi, request } from "../../src/lib/api";
import { useSession } from "../../src/lib/session";
import { time, date } from "../../src/lib/format";
import { colors as c } from "../../src/theme";
import type { ActiveVisitor, ActiveParcel } from "../../src/types/api";
import { Action, EnableAlerts } from "../../src/components/office";

interface ExpectedVisitor {
  id: string;
  name: string;
  phone: string;
  pin: string;
  qr_token: string;
  tower: string;
  flat: string;
  host_name: string;
  start_at: string;
  end_at: string;
  vehicle_number?: string;
  notes?: string;
  status: string;
}

const guardActions: {
  title: string;
  subtitle: string;
  icon: IconName;
  route: string;
  bg: string;
  color: string;
}[] = [
  {
    title: "Verify Visitor Pass",
    subtitle: "Scan QR or 6-digit PIN",
    icon: "shield-checkmark-outline",
    route: "/guard/verify",
    bg: "#E8F5E9",
    color: "#2E7D32",
  },
  {
    title: "Log Walk-in Entry",
    subtitle: "Cab, Guest, or Service",
    icon: "person-add-outline",
    route: "/guard/walk-in",
    bg: "#E3F2FD",
    color: "#1565C0",
  },
  {
    title: "Parcel Delivery Desk",
    subtitle: "Log packages & OTP pickup",
    icon: "cube-outline",
    route: "/guard/parcels",
    bg: "#FFF3E0",
    color: "#E65100",
  },
  {
    title: "Domestic Help",
    subtitle: "Record attendance & departures",
    icon: "people-outline",
    route: "/guard/help",
    bg: "#EDE7F6",
    color: "#512DA8",
  },
  {
    title: "Emergency Response",
    subtitle: "Acknowledge resident alerts",
    icon: "alert-circle-outline",
    route: "/guard/emergencies",
    bg: "#FFEBEE",
    color: "#C62828",
  },
  {
    title: "Society Directory",
    subtitle: "Emergency & Office numbers",
    icon: "call-outline",
    route: "/directory",
    bg: "#F3E5F5",
    color: "#7B1FA2",
  },
];

export default function GuardHome() {
  const property = useSession((s) => s.property);
  const client = useQueryClient();
  const [exitingId, setExitingId] = useState<string | null>(null);
  const [admittingId, setAdmittingId] = useState<string | null>(null);

  // Dynamic live queries - auto-refresh every 3 seconds for real-time gate syncing
  const visitorsQuery = useApi<ActiveVisitor[]>("/guard/visitors/active", 3000);
  const parcelsQuery = useApi<ActiveParcel[]>("/guard/parcels/active", 3000);
  const queue = useApi<any[]>("/guard/visitors/queue", 3000);
  const expectedQuery = useApi<ExpectedVisitor[]>("/guard/visitors/expected", 3000);

  const visitors = visitorsQuery.data || [];
  const parcels = parcelsQuery.data || [];
  const walkIns = queue.data || [];
  const expected = expectedQuery.data || [];

  const handleAdmitExpected = async (inv: ExpectedVisitor) => {
    try {
      setAdmittingId(inv.id);
      await request("/guard/visitors/check-in", {
        method: "POST",
        body: JSON.stringify({ invitation_id: inv.id }),
      });
      await Promise.all([
        expectedQuery.refetch(),
        visitorsQuery.refetch(),
        queue.refetch(),
      ]);
    } catch (err: any) {
      Alert.alert("Check-in Error", err?.message || "Could not check in guest.");
    } finally {
      setAdmittingId(null);
    }
  };

  const handleCheckOut = async (visitor: ActiveVisitor) => {
    Alert.alert(
      "Confirm Exit",
      `Mark ${visitor.name} (visiting ${visitor.tower} - ${visitor.flat}) as exited?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm Exit",
          style: "destructive",
          onPress: async () => {
            try {
              setExitingId(visitor.id);
              await request(`/guard/visitors/${visitor.id}/check-out`, { method: "POST" });
              await Promise.all([visitorsQuery.refetch(), queue.refetch()]);
            } catch (err: any) {
              Alert.alert("Error", err?.message || "Could not check out visitor.");
            } finally {
              setExitingId(null);
            }
          },
        },
      ]
    );
  };

  return (
    <Screen
      refresh={() => {
        void Promise.all([
          visitorsQuery.refetch(),
          parcelsQuery.refetch(),
          queue.refetch(),
          expectedQuery.refetch(),
        ]);
      }}
    >
      {/* Top Header with Guard Context & Role Switcher */}
      <View style={{ paddingTop: 10, paddingBottom: 16 }}>
        <Row style={{ alignItems: "center" }}>
          <View style={{ flex: 1 }}>
            <Row style={{ alignItems: "center", gap: 6 }}>
              <Icon name="shield-checkmark" size={18} color="#2E7D32" />
              <Txt weight="extra" style={{ fontSize: 20, color: c.ink }}>
                {property?.society || "Gate Control"}
              </Txt>
            </Row>
            <Txt muted style={{ fontSize: 13, marginTop: 2 }}>
              Gatekeeper Operations · {property?.flat || "Main Gate"}
            </Txt>
          </View>
          <Row style={{ gap: 8 }}>
            <IconButton
              name="swap-horizontal"
              label="Switch Property"
              onPress={() => router.push("/properties?switch=true")}
            />
            <IconButton
              name="log-out-outline"
              label="Sign Out"
              onPress={() => {
                void useSession.getState().clear();
                client.clear();
                router.replace("/welcome");
              }}
            />
          </Row>
        </Row>
      </View>

      <EnableAlerts />

      {/* KPI Stats Row (Dynamic real-time counters) */}
      <Row style={{ gap: 10, marginBottom: 16 }}>
        <Card style={{ flex: 1, backgroundColor: "#E0F2F1", borderColor: "#B2DFDB", padding: 12 }}>
          <Row style={{ justifyContent: "space-between", alignItems: "center" }}>
            <Icon name="calendar-outline" color="#00796B" size={22} />
            <Txt weight="extra" style={{ fontSize: 24, color: "#00796B" }}>
              {expected.length}
            </Txt>
          </Row>
          <Txt weight="bold" style={{ color: "#00796B", marginTop: 4, fontSize: 12 }}>
            Pre-Approved
          </Txt>
          <Txt style={{ color: "#00796B", fontSize: 10, opacity: 0.8 }}>
            Expected visitors
          </Txt>
        </Card>

        <Card style={{ flex: 1, backgroundColor: "#FFF8E1", borderColor: "#FFECB3", padding: 12 }}>
          <Row style={{ justifyContent: "space-between", alignItems: "center" }}>
            <Icon name="time-outline" color="#F57F17" size={22} />
            <Txt weight="extra" style={{ fontSize: 24, color: "#F57F17" }}>
              {walkIns.length}
            </Txt>
          </Row>
          <Txt weight="bold" style={{ color: "#F57F17", marginTop: 4, fontSize: 12 }}>
            Approvals
          </Txt>
          <Txt style={{ color: "#F57F17", fontSize: 10, opacity: 0.8 }}>
            Walk-in requests
          </Txt>
        </Card>

        <Card style={{ flex: 1, backgroundColor: "#E8F5E9", borderColor: "#C8E6C9", padding: 12 }}>
          <Row style={{ justifyContent: "space-between", alignItems: "center" }}>
            <Icon name="people" color="#2E7D32" size={22} />
            <Txt weight="extra" style={{ fontSize: 24, color: "#2E7D32" }}>
              {visitors.length}
            </Txt>
          </Row>
          <Txt weight="bold" style={{ color: "#2E7D32", marginTop: 4, fontSize: 12 }}>
            Inside
          </Txt>
          <Txt style={{ color: "#2E7D32", fontSize: 10, opacity: 0.8 }}>
            In society
          </Txt>
        </Card>

        <Card
          style={{ flex: 1, backgroundColor: "#FFF3E0", borderColor: "#FFE0B2", padding: 12 }}
          onPress={() => router.push("/guard/parcels")}
        >
          <Row style={{ justifyContent: "space-between", alignItems: "center" }}>
            <Icon name="cube" color="#E65100" size={22} />
            <Txt weight="extra" style={{ fontSize: 24, color: "#E65100" }}>
              {parcels.length}
            </Txt>
          </Row>
          <Txt weight="bold" style={{ color: "#E65100", marginTop: 4, fontSize: 12 }}>
            Parcels
          </Txt>
          <Txt style={{ color: "#E65100", fontSize: 10, opacity: 0.8 }}>
            Pending pickup
          </Txt>
        </Card>
      </Row>

      {/* SECTION 1: Pre-Approved / Expected Visitors Created by Residents */}
      <Section
        title={`Pre-Approved Visitors (${expected.length})`}
        action="Refresh"
        onPress={() => void expectedQuery.refetch()}
      />
      {expectedQuery.isLoading && <Loading />}
      <ErrorState error={expectedQuery.error} retry={expectedQuery.refetch} />

      {expected.length === 0 && !expectedQuery.isLoading && (
        <Card style={{ marginBottom: 14, backgroundColor: "#FAFAFA", borderColor: "#EEEEEE" }}>
          <Row style={{ alignItems: "center", gap: 10 }}>
            <Icon name="information-circle-outline" color={c.muted} size={20} />
            <Txt muted style={{ fontSize: 13, flex: 1 }}>
              No pre-approved visitor passes active right now. Resident-created passes will appear here automatically.
            </Txt>
          </Row>
        </Card>
      )}

      {expected.map((inv) => (
        <Card
          key={inv.id}
          style={{
            marginBottom: 10,
            paddingVertical: 12,
            borderLeftWidth: 4,
            borderLeftColor: "#00796B",
          }}
        >
          <Row style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
            <View style={{ flex: 1 }}>
              <Row style={{ alignItems: "center", gap: 8 }}>
                <Txt weight="bold" style={{ fontSize: 16, color: c.ink }}>
                  {inv.name}
                </Txt>
                <Badge status="Allowed" />
              </Row>

              <Txt muted style={{ fontSize: 13, marginTop: 3 }}>
                Destination:{" "}
                <Txt weight="bold" style={{ color: c.ink }}>
                  {inv.tower} · Flat {inv.flat}
                </Txt>
              </Txt>

              <Txt muted style={{ fontSize: 12, marginTop: 2 }}>
                Host: <Txt weight="medium" style={{ color: c.ink }}>{inv.host_name}</Txt> · Phone: {inv.phone}
              </Txt>

              {inv.vehicle_number ? (
                <Txt muted style={{ fontSize: 12, marginTop: 2 }}>
                  Vehicle: {inv.vehicle_number}
                </Txt>
              ) : null}

              <Row style={{ alignItems: "center", gap: 6, marginTop: 6 }}>
                <View
                  style={{
                    backgroundColor: "#E0F2F1",
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: "#B2DFDB",
                  }}
                >
                  <Txt weight="extra" style={{ color: "#004D40", fontSize: 13, letterSpacing: 1 }}>
                    PIN: {inv.pin}
                  </Txt>
                </View>
                <Txt muted style={{ fontSize: 11 }}>
                  Valid: {date(inv.start_at)} ({time(inv.start_at)} - {time(inv.end_at)})
                </Txt>
              </Row>
            </View>

            <Button
              title="Admit Guest"
              loading={admittingId === inv.id}
              onPress={() => void handleAdmitExpected(inv)}
              style={{ minHeight: 38, paddingHorizontal: 14 }}
            />
          </Row>
        </Card>
      ))}

      {/* SECTION 2: Walk-In Approvals Queue */}
      <Section
        title={`Walk-in Approvals (${walkIns.length})`}
        action="Refresh"
        onPress={() => void queue.refetch()}
      />
      <ErrorState error={queue.error} retry={queue.refetch} />

      {walkIns.length === 0 && !queue.isLoading && (
        <Card style={{ marginBottom: 14, backgroundColor: "#FAFAFA", borderColor: "#EEEEEE" }}>
          <Row style={{ alignItems: "center", gap: 10 }}>
            <Icon name="checkmark-done-circle-outline" color="#2E7D32" size={20} />
            <Txt muted style={{ fontSize: 13, flex: 1 }}>
              No walk-in visitors currently awaiting resident approval.
            </Txt>
          </Row>
        </Card>
      )}

      {walkIns.map((v) => (
        <Card key={v.id} style={{ marginBottom: 10 }}>
          <Row style={{ justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <Txt weight="bold" style={{ fontSize: 15 }}>
              {v.name} · {v.tower} / {v.flat}
            </Txt>
            <Badge status={v.status} />
          </Row>
          <Txt muted style={{ fontSize: 13, marginBottom: 8 }}>{v.purpose}</Txt>

          {v.status === "Allowed" && (
            <Action
              title="Record Entry"
              path={`/guard/visitors/${v.id}/admit`}
              after={() => {
                void Promise.all([visitorsQuery.refetch(), queue.refetch()]);
              }}
            />
          )}

          {v.status === "Waiting" && (
            <Button
              title="Call resident"
              secondary
              onPress={() => {
                void request<{ name: string; phone: string }[]>(`/guard/visitors/${v.id}/contacts`)
                  .then((contacts) => {
                    if (!contacts.length) {
                      Alert.alert("No contact", "Contact the society office.");
                      return;
                    }
                    Alert.alert(
                      "Call for visitor approval",
                      "Ask the resident to approve the request in their app.",
                      [
                        ...contacts.slice(0, 2).map((contact) => ({
                          text: contact.name,
                          onPress: () => {
                            void Linking.openURL(`tel:${contact.phone}`);
                          },
                        })),
                        { text: "Cancel", style: "cancel" as const },
                      ]
                    );
                  })
                  .catch((e) => Alert.alert("Could not load contacts", e.message));
              }}
            />
          )}
        </Card>
      ))}

      {/* SECTION 3: Main Guard Action Buttons */}
      <Section title="Gate Commands" />
      <View style={{ gap: 10, marginBottom: 16 }}>
        {guardActions.map((action) => (
          <Card
            key={action.title}
            onPress={() => router.push(action.route as never)}
            style={{
              backgroundColor: "#fff",
              borderLeftWidth: 4,
              borderLeftColor: action.color,
              paddingVertical: 14,
            }}
          >
            <Row style={{ alignItems: "center" }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: action.bg,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 14,
                }}
              >
                <Icon name={action.icon} color={action.color} size={24} />
              </View>
              <View style={{ flex: 1 }}>
                <Txt weight="bold" style={{ fontSize: 15, color: c.ink }}>
                  {action.title}
                </Txt>
                <Txt muted style={{ fontSize: 12 }}>
                  {action.subtitle}
                </Txt>
              </View>
              <Icon name="chevron-forward" color={c.muted} size={18} />
            </Row>
          </Card>
        ))}
      </View>

      {/* SECTION 4: Active Visitors Currently Inside List */}
      <Section
        title={`Visitors Inside (${visitors.length})`}
        action="Refresh"
        onPress={() => void visitorsQuery.refetch()}
      />
      {visitorsQuery.isLoading && <Loading />}
      <ErrorState error={visitorsQuery.error} retry={visitorsQuery.refetch} />

      {visitors.length === 0 && !visitorsQuery.isLoading && (
        <Empty
          icon="checkmark-circle-outline"
          title="Gate is Clear"
          description="No visitors are currently marked inside the premises."
        />
      )}

      {visitors.map((v) => (
        <Card key={v.id} style={{ marginBottom: 10, paddingVertical: 12 }}>
          <Row style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
            <View style={{ flex: 1 }}>
              <Row style={{ alignItems: "center", gap: 8 }}>
                <Txt weight="bold" style={{ fontSize: 16 }}>
                  {v.name}
                </Txt>
                <Badge status="Inside" />
              </Row>
              <Txt muted style={{ fontSize: 13, marginTop: 3 }}>
                Destination:{" "}
                <Txt weight="semibold" style={{ color: c.ink }}>
                  {v.tower} · Flat {v.flat}
                </Txt>
              </Txt>
              <Txt muted style={{ fontSize: 12, marginTop: 2 }}>
                {v.purpose} · Entered {time(v.entry_at)}
              </Txt>
            </View>

            <Button
              title="Mark Exit"
              danger
              secondary
              loading={exitingId === v.id}
              onPress={() => void handleCheckOut(v)}
              style={{ minHeight: 38, paddingHorizontal: 12 }}
            />
          </Row>
        </Card>
      ))}
    </Screen>
  );
}
