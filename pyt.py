import heapq
from datetime import datetime


def log(message):
    with open("app.log", "a") as f:
        f.write(f"{datetime.now()} - {message}\n")



TYPE_WEIGHT = {
    "Placement": 3,
    "Result": 2,
    "Event": 1
}



def calculate_score(notification):
    type_score = TYPE_WEIGHT.get(notification["Type"], 0)

    
    time_obj = datetime.strptime(notification["Timestamp"], "%Y-%m-%d %H:%M:%S")
    recency_score = time_obj.timestamp()

    return type_score * 10000000000 + recency_score



def get_top_notifications(notifications, k=10):
    min_heap = []

    for notif in notifications:
        score = calculate_score(notif)

        if len(min_heap) < k:
            heapq.heappush(min_heap, (score, notif))
        else:
            if score > min_heap[0][0]:
                heapq.heappushpop(min_heap, (score, notif))

        log(f"Processed notification {notif['ID']} with score {score}")


    result = sorted(min_heap, key=lambda x: x[0], reverse=True)

    return [item[1] for item in result]


notifications = [
    {
        "ID": "d146095a-0d86-4a34-9e69-3900a14576bc",
        "Type": "Result",
        "Message": "mid-sem",
        "Timestamp": "2026-04-22 17:51:30"
    },
    {
        "ID": "283218f-ea5a-4b7c-93a9-1f2f240d64b0",
        "Type": "Placement",
        "Message": "CSX Corporation hiring",
        "Timestamp": "2026-04-22 17:51:18"
    },
    {
        "ID": "81589ada-0ad3-4f77-9554-f52fb558e09d",
        "Type": "Event",
        "Message": "farewell",
        "Timestamp": "2026-04-22 17:51:06"
    },
    {
        "ID": "0005513a-142b-4bbc-8678-eefec65e1ede",
        "Type": "Result",
        "Message": "mid-sem",
        "Timestamp": "2026-04-22 17:50:54"
    }
]

top_notifications = get_top_notifications(notifications, 10)

print("\nTop Notifications:\n")
for n in top_notifications:
    print(n)


