import { useFinance } from "../../../context/FinanceContext";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardActionArea,
  Grid,
  Avatar,
  Button,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  alpha,
} from "@mui/material";
import ReceiptIcon from "@mui/icons-material/Receipt";
import SavingsIcon from "@mui/icons-material/Savings";
import HandshakeIcon from "@mui/icons-material/Handshake";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

const CATEGORY_COLORS = {
  Market: "#F59E0B",
  Fatura: "#EF4444",
  Kafe: "#EE5253",
  Ulaşım: "#3B82F6",
  Yemek: "#8B5CF6",
  Eğlence: "#00D9A3",
  Diğer: "#525C70",
  Maaş: "#10B981",
  Yatırım: "#6366F1",
};

export default function FinanceDashboard() {
  const { transactions, bills, savings, debts } = useFinance();
  const { profile } = useAuth();
  const navigate = useNavigate();

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const formatMoney = (val) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const monthlyTx = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalIncome = monthlyTx
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = monthlyTx
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpense;

  const expenseByCategory = monthlyTx
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const totalExpenseForChart = Object.values(expenseByCategory).reduce(
    (sum, val) => sum + val,
    0,
  );

  let accumulatedPercent = 0;
  const donutData = Object.entries(expenseByCategory).map(
    ([category, amount]) => {
      const percent =
        totalExpenseForChart > 0 ? (amount / totalExpenseForChart) * 100 : 0;
      const startPercent = accumulatedPercent;
      accumulatedPercent += percent;
      return {
        category,
        amount,
        percent,
        startPercent,
        color: CATEGORY_COLORS[category] || "#525C70",
      };
    },
  );

  const circ = 2 * Math.PI * 40;

  const unpaidBillsTotal = bills
    .filter((b) => !b.paid)
    .reduce((sum, b) => sum + b.amount, 0);
  const totalSavings = savings.reduce((sum, s) => sum + s.currentAmount, 0);
  const totalBorrowed = debts
    .filter((d) => d.type === "borrowed" && !d.paid)
    .reduce((sum, d) => sum + d.amount, 0);
  const totalLent = debts
    .filter((d) => d.type === "lent" && !d.paid)
    .reduce((sum, d) => sum + d.amount, 0);

  return (
    <Box sx={{ pb: 10, pt: 2, px: 2, position: "relative" }}>
      {/* Header Profile Greeting */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
        sx={{ position: "relative", zIndex: 1 }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              background: (theme) => theme.palette.gradients.primaryText,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 0.5,
            }}
          >
            Cüzdanım
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Aylık finansal özetiniz
          </Typography>
        </Box>
        <Avatar
          src={profile?.photoURL}
          sx={{
            bgcolor: "primary.main",
            width: (theme) => theme.spacing(6.5),
            height: (theme) => theme.spacing(6.5),
            border: 2,
            borderColor: (theme) => alpha(theme.palette.primary.main, 0.5),
            boxShadow: (theme) =>
              `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
            transition:
              "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            "&:hover": { transform: "scale(1.1)" },
          }}
        >
          {!profile?.photoURL && "💳"}
        </Avatar>
      </Box>

      {/* Balance Banner - Premium Glassmorphism */}
      <Box sx={{ position: "relative", mb: 4 }}>
        {/* Glow behind the banner */}
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "120%",
            height: "140%",
            background: (theme) =>
              `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.15)} 0%, transparent 70%)`,
            filter: "blur(30px)",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />

        <Card
          sx={{
            textAlign: "center",
            p: 3,
            pt: 4,
            position: "relative",
            zIndex: 1,
            backgroundImage: (theme) => theme.palette.gradients.appFinance,
            bgcolor: "background.glass",
            backdropFilter: "blur(24px)",
            border: 1,
            borderColor: "glassBorder",
            boxShadow: (theme) =>
              `0 24px 48px ${alpha(theme.palette.common.black, 0.4)}, inset 0 1px 1px ${alpha(theme.palette.common.white, 0.1)}`,
            borderRadius: 6,
            overflow: "hidden",
          }}
        >
          {/* Decorative mesh/gradient inside card */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "150px",
              height: "150px",
              background: (theme) =>
                `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%)`,
              pointerEvents: "none",
            }}
          />

          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ display: "block", mb: 1, opacity: 0.8 }}
          >
            MEVCUT BAKİYE
          </Typography>
          <Typography
            variant="h2"
            sx={{
              mb: 1,
              color: netBalance >= 0 ? "text.primary" : "error.main",
              textShadow: (theme) =>
                netBalance >= 0 ? `0 0 24px ${alpha(theme.palette.common.white, 0.3)}` : "none",
            }}
          >
            {formatMoney(netBalance)}
          </Typography>

          <Stack direction="row" spacing={2} mt={4}>
            <Box
              flex={1}
              sx={{
                bgcolor: "background.glassActive",
                p: 2,
                borderRadius: 4,
                border: 1,
                borderColor: "glassBorder",
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: "background.glassHover",
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                mb={0.5}
              >
                GELİR
              </Typography>
              <Typography variant="h6" color="secondary.main">
                {formatMoney(totalIncome)}
              </Typography>
            </Box>
            <Box
              flex={1}
              sx={{
                bgcolor: "background.glassActive",
                p: 2,
                borderRadius: 4,
                border: 1,
                borderColor: "glassBorder",
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: "background.glassHover",
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                mb={0.5}
              >
                GİDER
              </Typography>
              <Typography variant="h6" color="error.light">
                {formatMoney(totalExpense)}
              </Typography>
            </Box>
          </Stack>
        </Card>
      </Box>

      {/* Dynamic App Sub-Sections */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={6}>
          <Card
            sx={{
              height: "100%",
              borderRadius: 5,
              overflow: "hidden",
              transition: "all 0.3s ease",
              border: 1,
              borderColor: "glassBorder",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: (theme) => `0 12px 24px ${alpha(theme.palette.common.black, 0.3)}`,
              },
            }}
          >
            <CardActionArea
              onClick={() => navigate("/finance/bills")}
              sx={{ height: "100%", p: 2.5, position: "relative" }}
            >
              <Box
                sx={{
                  position: "absolute",
                  right: -10,
                  top: -10,
                  opacity: 0.1,
                }}
              >
                <ReceiptIcon sx={{ fontSize: 80 }} />
              </Box>
              <Avatar
                sx={{
                  bgcolor: "warning.main",
                  color: "common.white",
                  mb: 2,
                  width: (theme) => theme.spacing(6),
                  height: (theme) => theme.spacing(6),
                  boxShadow: (theme) =>
                    `0 4px 12px ${alpha(theme.palette.warning.main, 0.4)}`,
                }}
              >
                <ReceiptIcon />
              </Avatar>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                FATURALAR
              </Typography>
              <Typography
                variant="h6"
                color={unpaidBillsTotal > 0 ? "warning.main" : "text.primary"}
                mt={0.5}
              >
                {unpaidBillsTotal > 0
                  ? formatMoney(unpaidBillsTotal)
                  : "Ödendi"}
              </Typography>
            </CardActionArea>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card
            sx={{
              height: "100%",
              borderRadius: 5,
              overflow: "hidden",
              transition: "all 0.3s ease",
              border: 1,
              borderColor: "glassBorder",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: (theme) => `0 12px 24px ${alpha(theme.palette.common.black, 0.3)}`,
              },
            }}
          >
            <CardActionArea
              onClick={() => navigate("/finance/savings")}
              sx={{ height: "100%", p: 2.5, position: "relative" }}
            >
              <Box
                sx={{
                  position: "absolute",
                  right: -10,
                  top: -10,
                  opacity: 0.1,
                }}
              >
                <SavingsIcon sx={{ fontSize: 80 }} />
              </Box>
              <Avatar
                sx={{
                  bgcolor: "secondary.main",
                  color: "background.default",
                  mb: 2,
                  width: (theme) => theme.spacing(6),
                  height: (theme) => theme.spacing(6),
                  boxShadow: (theme) =>
                    `0 4px 12px ${alpha(theme.palette.secondary.main, 0.3)}`,
                }}
              >
                <SavingsIcon />
              </Avatar>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                BİRİKİMLER
              </Typography>
              <Typography variant="h6" color="secondary.main" mt={0.5}>
                {formatMoney(totalSavings)}
              </Typography>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>

      {/* Debts Widget */}
      <Card
        sx={{
          mb: 4,
          borderRadius: 5,
          overflow: "hidden",
          border: 1,
          borderColor: "glassBorder",
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: (theme) => `0 12px 24px ${alpha(theme.palette.common.black, 0.3)}`,
          },
        }}
      >
        <CardActionArea
          onClick={() => navigate("/finance/debts")}
          sx={{ p: 3 }}
        >
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <Avatar
              sx={{
                bgcolor: "info.main",
                color: "common.white",
                width: (theme) => theme.spacing(6),
                height: (theme) => theme.spacing(6),
                boxShadow: (theme) =>
                  `0 4px 12px ${alpha(theme.palette.info.main, 0.4)}`,
              }}
            >
              <HandshakeIcon />
            </Avatar>
            <Typography variant="h6" color="text.primary">
              Borç Hesapları
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Box
              flex={1}
              sx={{
                bgcolor: "background.glassActive",
                p: 2,
                borderRadius: 3,
                border: 1,
                borderColor: "glassBorder",
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                BORÇ
              </Typography>
              <Typography variant="subtitle1" color="error.light">
                {formatMoney(totalBorrowed)}
              </Typography>
            </Box>
            <Box
              flex={1}
              sx={{
                bgcolor: "background.glassActive",
                p: 2,
                borderRadius: 3,
                border: 1,
                borderColor: "glassBorder",
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                ALACAK
              </Typography>
              <Typography variant="subtitle1" color="secondary.main">
                {formatMoney(totalLent)}
              </Typography>
            </Box>
          </Stack>
        </CardActionArea>
      </Card>

      {/* Spending Distribution */}
      <Card
        sx={{
          mb: 4,
          p: 3,
          borderRadius: 5,
          border: 1,
          borderColor: "glassBorder",
        }}
      >
        <Typography variant="h6" mb={3}>
          Harcama Dağılımı
        </Typography>

        {totalExpenseForChart === 0 ? (
          <Box py={6} textAlign="center">
            <AccountBalanceWalletIcon
              sx={{ fontSize: 64, color: "text.disabled", mb: 2, opacity: 0.5 }}
            />
            <Typography variant="body1" color="text.secondary">
              Bu ay henüz harcama yapmadınız
            </Typography>
          </Box>
        ) : (
          <Box display="flex" alignItems="center" gap={4}>
            <Box
              sx={{
                position: "relative",
                width: 140,
                height: 140,
                flexShrink: 0,
              }}
            >
              <svg
                width="140"
                height="140"
                viewBox="0 0 100 100"
                style={{
                  transform: "rotate(-90deg)",
                  filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.4))",
                }}
              >
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="var(--border)"
                  strokeWidth="12"
                />
                {donutData.map((d, index) => {
                  const dashoffset = circ - (d.percent / 100) * circ;
                  const rotation = (d.startPercent / 100) * 360;
                  return (
                    <circle
                      key={index}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke={d.color}
                      strokeWidth="12"
                      strokeDasharray={circ}
                      strokeDashoffset={dashoffset}
                      strokeLinecap="round"
                      transform={`rotate(${rotation} 50 50)`}
                      style={{
                        transition:
                          "stroke-dashoffset 1.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                      }}
                    />
                  );
                })}
              </svg>
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Gider
                </Typography>
                <Typography variant="subtitle1" sx={{ lineHeight: 1, mt: 0.5 }}>
                  {formatMoney(totalExpenseForChart)}
                </Typography>
              </Box>
            </Box>

            <Stack spacing={2} flex={1}>
              {donutData.map((d, i) => (
                <Box
                  key={i}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        bgcolor: d.color,
                        boxShadow: `0 0 8px ${d.color}80`,
                      }}
                    />
                    <Typography variant="body2">{d.category}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    %{Math.round(d.percent)}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        )}
      </Card>

      {/* Recent Activity */}
      <Box mb={2}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6">Son İşlemler</Typography>
          <Button
            size="small"
            endIcon={<ArrowForwardIosIcon sx={{ fontSize: 12 }} />}
            onClick={() => navigate("/finance/transactions")}
            sx={{
              color: "text.secondary",
              "&:hover": { color: "primary.light" },
            }}
          >
            Tümü
          </Button>
        </Box>

        {transactions.length === 0 ? (
          <Card
            sx={{
              p: 4,
              textAlign: "center",
              borderStyle: "dashed",
              borderRadius: 4,
              bgcolor: "transparent",
              borderColor: "glassBorder",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Henüz işlem kaydedilmedi.
            </Typography>
          </Card>
        ) : (
          <Card
            sx={{
              borderRadius: 5,
              overflow: "hidden",
              border: 1,
              borderColor: "glassBorder",
            }}
          >
            <List disablePadding>
              {transactions.slice(0, 4).map((t, idx) => (
                <div key={t.id}>
                  <ListItem
                    sx={{
                      py: 2.5,
                      px: 3,
                      transition: "background 0.2s",
                      "&:hover": { bgcolor: "background.glassActive" },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: (theme) =>
                            t.type === "income"
                              ? alpha(theme.palette.secondary.main, 0.15)
                              : alpha(theme.palette.error.main, 0.15),
                          color:
                            t.type === "income"
                              ? "secondary.main"
                              : "error.main",
                          borderRadius: 3,
                        }}
                      >
                        {t.type === "income" ? (
                          <ArrowDownwardIcon />
                        ) : (
                          <ArrowUpwardIcon />
                        )}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2">
                          {t.description || t.category}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {t.date} · {t.category}
                        </Typography>
                      }
                    />
                    <Typography
                      variant="subtitle1"
                      color={
                        t.type === "income" ? "secondary.main" : "text.primary"
                      }
                    >
                      {t.type === "income" ? "+" : "-"}
                      {formatMoney(t.amount)}
                    </Typography>
                  </ListItem>
                  {idx < Math.min(transactions.length, 4) - 1 && (
                    <Divider
                      component="li"
                      sx={{ borderColor: "glassBorder" }}
                    />
                  )}
                </div>
              ))}
            </List>
          </Card>
        )}
      </Box>
    </Box>
  );
}
