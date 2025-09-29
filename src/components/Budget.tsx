
// Define the structure of a component
interface AudioComponent {
  id: string;
  name: string;
  price: number;
}

interface BudgetProps {
  selectedComponents: AudioComponent[];
}

function Budget({ selectedComponents }: BudgetProps) {
  const totalCost = selectedComponents.reduce((total, comp) => total + comp.price, 0);

  return (
    <div className="budget-tracker">
      <h3>Project Budget</h3>
      <div className="budget-total">
        <span>Total:</span>
        <strong>${totalCost.toFixed(2)}</strong>
      </div>
      <div className="selected-components-list">
        <h4>Selected Items:</h4>
        <ul>
          {selectedComponents.map((comp, index) => (
            <li key={`${comp.id}-${index}`}>{comp.name} - ${comp.price.toFixed(2)}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Budget;
