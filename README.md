# Active Cursor

This script prevents the system from becoming idle by moving the mouse cursor at random intervals. The user can specify the interval for checking mouse activity and the maximum time before the cursor moves.

## Requirements

- Node.js

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/melkoto/active-cursor
   cd active-cursor
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

To start the script, use the following command:

```bash
npm start
```

After running the script, you will be prompted to enter two values:

1. **Interval for checking mouse activity (in minutes)**: This defines how frequently the script will check if the mouse has been moved. The minimum value is 1 minute.
2. **Maximum time before moving the mouse (in minutes)**: This defines the maximum time the mouse can remain inactive before the script moves it. The minimum value must be at least 1 minute more than the interval.

### Example

If you enter:

```text
Enter the interval for checking mouse activity (in minutes, minimum 1): 1
Enter the maximum time before moving the mouse (in minutes, minimum 2): 3
```

The script will check mouse activity every 1 minute and move the mouse randomly before 2 minutes of inactivity.

### Output Example

```text
[5:41:09 PM] Mouse moved to: (1422, 843). Time passed since last move: 1 minute 15 seconds.
[5:42:00 PM] Mouse movement detected. Timer reset.
[5:42:03 PM] Mouse moved to: (1322, 778). Time passed since last move: 3 seconds.
```

