import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/hooks/use-locale";
import { formatCurrency } from "@/lib/utils";
import { Edit, Trash } from "lucide-react";
import { Sale, Product } from "@/shared/types";

interface SalesTableProps {
  sales: Sale[];
  products: Product[];
  onEdit: (sale: Sale) => void;
}

export function SalesTable({ sales, products, onEdit }: SalesTableProps) {
  const { t } = useLocale();
  const [page, setPage] = useState(1);

  const ITEMS_PER_PAGE = 10;
  const start = (page - 1) * ITEMS_PER_PAGE;
  const paginatedData = sales.slice(start, start + ITEMS_PER_PAGE);
  const totalPages = Math.ceil(sales.length / ITEMS_PER_PAGE);

  // Helper function to get product name by id
  const getProductName = (productId: number) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : "Unknown";
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("sales.date")}</TableHead>
            <TableHead>{t("sales.product")}</TableHead>
            <TableHead className="text-right">{t("sales.quantity")}</TableHead>
            <TableHead className="text-right">{t("sales.price")}</TableHead>
            <TableHead className="text-right">{t("sales.total")}</TableHead>
            <TableHead>{t("sales.employee")}</TableHead>
            <TableHead className="text-right">{t("common.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((sale) => (
            <TableRow key={sale.id}>
              <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
              <TableCell>{getProductName(sale.productId)}</TableCell>
              <TableCell className="text-right">{sale.quantity}</TableCell>
              <TableCell className="text-right">{formatCurrency(sale.price)}</TableCell>
              <TableCell className="text-right">{formatCurrency(sale.price * sale.quantity)}</TableCell>
              <TableCell>{sale.employee || "-"}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(sale)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            variant="outline"
            size="sm"
          >
            {t("common.previous")}
          </Button>
          <span className="flex items-center mx-2">
            {t("common.page")} {page} / {totalPages}
          </span>
          <Button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            variant="outline"
            size="sm"
          >
            {t("common.next")}
          </Button>
        </div>
      )}
    </div>
  );
}