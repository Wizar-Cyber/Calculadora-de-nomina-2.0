import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePayrollStore } from '@/store/usePayrollStore';

const QUINCENAS = ['15', '30'];

export function QuincenaSelect() {
  const { quincena, setQuincena, calculatePayroll } = usePayrollStore();

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Quincena</p>
      <Select
        value={quincena}
        onValueChange={(value) => {
          setQuincena(value);
          void calculatePayroll();
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecciona" />
        </SelectTrigger>
        <SelectContent>
          {QUINCENAS.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
