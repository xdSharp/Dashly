import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Search, 
  UserPlus, 
  Edit, 
  Trash, 
  Mail, 
  Phone, 
  MapPin,
  User
} from "lucide-react";
import { Customer } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onSave: (customer: Partial<Customer>) => void;
}

interface CustomersListProps {
  customers: Customer[];
  onDelete: (id: number) => void;
  onEdit: (customer: Customer) => void;
  onAdd: () => void;
}

export function CustomersList({ 
  customers, 
  onDelete, 
  onEdit,
  onAdd
}: CustomersListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Фильтр по поисковому запросу
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (customer.phone && customer.phone.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = (customer: Customer) => {
    if (window.confirm(`Вы уверены, что хотите удалить клиента "${customer.name}"?`)) {
      onDelete(customer.id);
      toast({
        title: "Клиент удален",
        description: `Клиент "${customer.name}" был успешно удален.`,
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Клиенты</CardTitle>
            <CardDescription>
              Управление базой клиентов и контактами
            </CardDescription>
          </div>
          <Button onClick={onAdd} className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            <span>Добавить клиента</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Поиск клиентов..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {filteredCustomers.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Клиент</TableHead>
                  <TableHead>Контакты</TableHead>
                  <TableHead>Покупки</TableHead>
                  <TableHead>Сумма</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="font-medium">{customer.name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {customer.email && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Mail className="mr-2 h-4 w-4" />
                            {customer.email}
                          </div>
                        )}
                        {customer.phone && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Phone className="mr-2 h-4 w-4" />
                            {customer.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{customer.totalPurchases}</TableCell>
                    <TableCell>{customer.totalSpent?.toLocaleString()} ₽</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(customer)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Редактировать</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(customer)}
                        >
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Удалить</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : searchTerm ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold">Клиенты не найдены</h3>
            <p className="text-muted-foreground mt-2">
              По запросу "{searchTerm}" не найдено ни одного клиента
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <User className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold">Нет клиентов</h3>
            <p className="text-muted-foreground mt-2">
              В вашей базе еще нет клиентов. Начните с добавления нового клиента.
            </p>
            <Button className="mt-4" onClick={onAdd}>
              <UserPlus className="h-4 w-4 mr-2" />
              Добавить клиента
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 