import { useState } from "react";
import { useFinance } from "../../../context/FinanceContext";
import { useToast } from "../../../components/ui/Toast";
import Modal from "../../../components/ui/Modal";
import {
  Box,
  Typography,
  Grid,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  Card,
  Stack,
  Avatar,
  Divider,
  InputAdornment,
  ListItemAvatar,
  alpha,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";

const INCOME_CATEGORIES = ["Maaş", "Yatırım", "Ek Gelir", "Diğer"];
const EXPENSE_CATEGORIES = [
  "Market",
  "Fatura",
  "Kafe",
  "Ulaşım",
  "Yemek",
  "Eğlence",
  "Diğer",
];

export default function Transactions() {
  const { transactions, addTransaction, deleteTransaction } = useFinance();
  const showToast = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [filterType, setFilterType] = useState("all"); // 'all' | 'income' | 'expense'
  const [searchTerm, setSearchTerm] = useState("");

  // Form states
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));

  const handleTypeChange = (e, newType) => {
    if (newType !== null) {
      setType(newType);
      setCategory(
        newType === "income" ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0],
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0) {
      showToast("Lütfen geçerli bir tutar girin.", "error");
      return;
    }

    try {
      await addTransaction({
        type,
        amount: numericAmount,
        category,
        description: description.trim() || category,
        date,
        time,
      });
      showToast("İşlem başarıyla kaydedildi! 🎉", "success");
      setIsOpen(false);
      // Reset form
      setAmount("");
      setDescription("");
    } catch {
      showToast("Kayıt oluşturulurken bir hata oluştu.", "error");
    }
  };

  // Filter transactions
  const filteredTx = transactions.filter((t) => {
    const matchesType = filterType === "all" || t.type === filterType;
    const matchesSearch =
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Format helper
  const formatMoney = (val) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Group by date
  const groupedTx = filteredTx.reduce((acc, t) => {
    acc[t.date] = acc[t.date] || [];
    acc[t.date].push(t);
    return acc;
  }, {});

  return (
    <Box sx={{ pb: 10, pt: 2, px: 2 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <Typography variant="h5" fontWeight="900">
            İşlem Geçmişi
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tüm gelir ve giderleriniz
          </Typography>
        </Box>
        <IconButton
          color="primary"
          onClick={() => setIsOpen(true)}
          sx={{
            bgcolor: "primary.main",
            color: "primary.contrastText",
            "&:hover": { bgcolor: "primary.dark" },
          }}
        >
          <AddIcon />
        </IconButton>
      </Box>

      {/* Filter segment and search */}
      <Stack spacing={2} mb={3}>
        <ToggleButtonGroup
          color="primary"
          value={filterType}
          exclusive
          onChange={(e, val) => val && setFilterType(val)}
          fullWidth
          size="small"
        >
          <ToggleButton value="all">Tümü</ToggleButton>
          <ToggleButton value="income">Gelirler</ToggleButton>
          <ToggleButton value="expense">Giderler</ToggleButton>
        </ToggleButtonGroup>

        <TextField
          variant="outlined"
          placeholder="İşlemlerde ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      {/* Transactions list */}
      {filteredTx.length === 0 ? (
        <Card
          sx={{
            borderRadius: 6,
            p: 5,
            textAlign: "center",
            bgcolor: "background.glass",
            backdropFilter: "blur(20px)",
            border: "1px dashed",
            borderColor: "glassBorder",
          }}
        >
          <Typography variant="h3" mb={2} sx={{ opacity: 0.5 }}>
            💸
          </Typography>
          <Typography variant="h6" fontWeight="900">
            İşlem Bulunamadı
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight="500">
            Arama kriterlerine uygun veya kayıtlı bir işlem yok.
          </Typography>
        </Card>
      ) : (
        <Stack spacing={3}>
          {Object.entries(groupedTx)
            .sort((a, b) => b[0].localeCompare(a[0]))
            .map(([dateKey, list]) => {
              const d = new Date(dateKey);
              const dateOptions = {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              };
              const dateLabel = d.toLocaleDateString("tr-TR", dateOptions);

              return (
                <Box key={dateKey}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    fontWeight="800"
                    textTransform="uppercase"
                    letterSpacing={1}
                    sx={{
                      position: "sticky",
                      top: "70px",
                      bgcolor: "background.glassActive",
                      backdropFilter: "blur(12px)",
                      zIndex: 1,
                      py: 1.5,
                      mb: 1,
                      borderRadius: 3,
                      px: 2,
                      border: 1,
                      borderColor: "glassBorder",
                    }}
                  >
                    {dateLabel}
                  </Typography>
                  <Card
                    sx={{ 
                      borderRadius: 6, 
                      bgcolor: "background.glass",
                      border: 1,
                      borderColor: "glassBorder",
                      overflow: "hidden"
                    }}
                  >
                    <List disablePadding>
                      {list.map((t, idx) => (
                        <div key={t.id}>
                          <ListItem
                            sx={{ 
                              py: 2,
                              px: 3,
                              transition: "all 0.2s ease-in-out",
                              "&:hover": {
                                bgcolor: "background.glassHover",
                                transform: "translateX(4px)",
                              }
                            }}
                            secondaryAction={
                              <IconButton
                                edge="end"
                                aria-label="delete"
                                onClick={() => {
                                  deleteTransaction(t.id);
                                  showToast("İşlem silindi.", "info");
                                }}
                              >
                                <DeleteIcon
                                  fontSize="small"
                                  sx={{ color: "text.secondary" }}
                                />
                              </IconButton>
                            }
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
                              primary={t.description}
                              secondary={`${t.time} · ${t.category}`}
                              primaryTypographyProps={{
                                variant: "subtitle2",
                                fontWeight: "800",
                              }}
                              secondaryTypographyProps={{
                                variant: "caption",
                                fontWeight: "500",
                              }}
                            />
                            <Box textAlign="right" mr={2}>
                              <Typography
                                variant="subtitle1"
                                fontWeight="900"
                                color={
                                  t.type === "income"
                                    ? "secondary.main"
                                    : "text.primary"
                                }
                              >
                                {t.type === "income" ? "+" : "-"}
                                {formatMoney(t.amount)}
                              </Typography>
                            </Box>
                          </ListItem>
                          {idx < list.length - 1 && (
                            <Divider
                              component="li"
                              sx={{ borderColor: "glassBorder", mx: 3 }}
                            />
                          )}
                        </div>
                      ))}
                    </List>
                  </Card>
                </Box>
              );
            })}
        </Stack>
      )}

      {/* Add Transaction Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Yeni İşlem Ekle"
      >
        <form onSubmit={handleSubmit}>
          <Stack spacing={3} mt={1}>
            <ToggleButtonGroup
              color="primary"
              value={type}
              exclusive
              onChange={handleTypeChange}
              fullWidth
              size="small"
            >
              <ToggleButton value="expense">Gider</ToggleButton>
              <ToggleButton value="income">Gelir</ToggleButton>
            </ToggleButtonGroup>

            <TextField
              label="Tutar (TL)"
              type="number"
              variant="outlined"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Kategori</InputLabel>
              <Select
                value={category}
                label="Kategori"
                onChange={(e) => setCategory(e.target.value)}
              >
                {(type === "income"
                  ? INCOME_CATEGORIES
                  : EXPENSE_CATEGORIES
                ).map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Açıklama"
              type="text"
              variant="outlined"
              placeholder="Örn: Mutfak Alışverişi"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
            />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Tarih"
                  type="date"
                  variant="outlined"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Saat"
                  type="time"
                  variant="outlined"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              sx={{ borderRadius: 8 }}
            >
              İşlemi Kaydet ✨
            </Button>
          </Stack>
        </form>
      </Modal>
    </Box>
  );
}
